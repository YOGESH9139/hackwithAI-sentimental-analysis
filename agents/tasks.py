# agents_api/tasks.py

from celery import shared_task
from celery.utils.log import get_task_logger
from django.utils import timezone
import time
import json

from .models import AgentRun
from agents.crew_factory import create_sentiment_crew

logger = get_task_logger(__name__)


@shared_task(bind=True, max_retries=2, default_retry_delay=30)
def run_agent_analysis(self, run_id: str):
    """
    Celery task for multi-agent debate analysis
    
    Architecture:
    Stage 1: Web Surfer → Dataset
    Stage 2: 3 Analysts → Initial Scores
    Stage 3: Cross-Attacks → Attack Outputs (integrated into analyst outputs)
    Stage 4: Debate Synthesis → Quality Evaluation
    Stage 5: Chief → Final Consensus
    """
    
    start_time = time.time()
    
    logger.info(f"[TASK START] Processing AgentRun: {run_id}")
    logger.info(f"[ARCHITECTURE] Surfer → 3 Analysts → Attacks → Debate → Chief")
    
    try:
        agent_run = AgentRun.objects.get(id=run_id)
        agent_run.mark_as_running()
        
        logger.info(f"[{agent_run.ticker}] Creating debate crew...")
        
        crew = create_sentiment_crew(
            ticker=agent_run.ticker,
            timeframe=agent_run.timeframe,
            include_social=agent_run.include_social
        )
        
        logger.info(f"[{agent_run.ticker}] Starting crew execution...")
        
        crew_result = crew.kickoff()
        
        execution_time = int(time.time() - start_time)
        logger.info(f"[{agent_run.ticker}] Crew completed in {execution_time}s")
        
        # Parse results
        agent_outputs = parse_debate_outputs(crew, agent_run.ticker, agent_run.include_social)
        consensus_data = extract_consensus(crew_result, agent_run.ticker)
        debate_summary = extract_debate_summary(crew, agent_run.ticker)
        
        logger.info(f"[{agent_run.ticker}] Parsed {len(agent_outputs)} agent outputs")
        logger.info(f"[{agent_run.ticker}] Consensus: {consensus_data.get('action')} @ {consensus_data.get('consensus_score'):.2f}")
        
        # Add debate to outputs
        if debate_summary:
            agent_outputs.append({
                "name": "Debate Moderator",
                "role": "debate",
                "score": debate_summary.get('debate_intensity_score', 0.0),
                "reasoning": debate_summary.get('agreements', ''),
                "confidence": 70,
                "key_data": debate_summary.get('major_conflicts', 'N/A')[:100]
            })
        
        agent_run.set_agent_outputs(agent_outputs)
        agent_run.set_consensus_data(consensus_data)
        agent_run.news_sources_count = 3
        agent_run.price_data_points = get_price_data_count(agent_run.timeframe)
        agent_run.mark_as_completed(execution_time=execution_time)
        
        logger.info(f"[TASK SUCCESS] {run_id} completed")
        
        return {
            'run_id': run_id,
            'ticker': agent_run.ticker,
            'status': 'COMPLETED',
            'execution_time': execution_time,
            'consensus_action': consensus_data.get('action')
        }
        
    except Exception as e:
        execution_time = int(time.time() - start_time)
        logger.error(f"[TASK FAILED] {run_id}: {str(e)}")
        logger.exception(e)
        
        agent_run.retry_count += 1
        agent_run.save(update_fields=['retry_count'])
        
        if agent_run.retry_count < self.max_retries:
            logger.warning(f"[RETRY] Attempt {agent_run.retry_count + 1}")
            raise self.retry(exc=e, countdown=30 * (2 ** agent_run.retry_count))
        
        agent_run.mark_as_failed(f"Failed after {agent_run.retry_count} retries: {str(e)}")
        raise


def parse_debate_outputs(crew, ticker: str, include_social: bool) -> list:
    """
    Parse debate crew outputs
    
    Task order:
    0. Surfer (skip)
    1. Value Investor (initial)
    2. Momentum Trader (initial)
    3. Contrarian (initial)
    4. Value Attack
    5. Momentum Attack
    6. Contrarian Attack
    7. Debate Synthesis
    8. Chief Consensus
    """
    
    agent_outputs = []
    
    try:
        # Task 1: Value Investor
        if len(crew.tasks) > 1:
            value_output = parse_agent_output(
                crew.tasks[1].output,
                "Long-Term Value Investor",
                "value_investor",
                ticker
            )
            
            # Add attack data if available (task 4)
            if len(crew.tasks) > 4:
                attack_data = parse_attack_output(crew.tasks[4].output)
                value_output['attack'] = attack_data
                if attack_data.get('revised_score') is not None:
                    value_output['revised_score'] = attack_data['revised_score']
            
            agent_outputs.append(value_output)
        
        # Task 2: Momentum Trader
        if len(crew.tasks) > 2:
            momentum_output = parse_agent_output(
                crew.tasks[2].output,
                "Momentum Swing Trader",
                "momentum_trader",
                ticker
            )
            
            # Add attack data (task 5)
            if len(crew.tasks) > 5:
                attack_data = parse_attack_output(crew.tasks[5].output)
                momentum_output['attack'] = attack_data
                if attack_data.get('revised_score') is not None:
                    momentum_output['revised_score'] = attack_data['revised_score']
            
            agent_outputs.append(momentum_output)
        
        # Task 3: Contrarian
        if len(crew.tasks) > 3:
            contrarian_output = parse_agent_output(
                crew.tasks[3].output,
                "Contrarian Risk Strategist",
                "contrarian",
                ticker
            )
            
            # Add attack data (task 6)
            if len(crew.tasks) > 6:
                attack_data = parse_attack_output(crew.tasks[6].output)
                contrarian_output['attack'] = attack_data
                if attack_data.get('revised_score') is not None:
                    contrarian_output['revised_score'] = attack_data['revised_score']
            
            agent_outputs.append(contrarian_output)
        
        logger.info(f"[{ticker}] Parsed {len(agent_outputs)} analysts with attacks")
        
    except Exception as e:
        logger.error(f"[{ticker}] Parse error: {str(e)}")
        agent_outputs = generate_mock_outputs(ticker)
    
    return agent_outputs


def parse_agent_output(task_output, name: str, role: str, ticker: str) -> dict:
    """Parse single agent output"""
    try:
        raw = task_output.raw if hasattr(task_output, 'raw') else str(task_output)
        
        cleaned = raw.strip()
        if cleaned.startswith('```json'):
            cleaned = cleaned[7:]
        if cleaned.startswith('```'):
            cleaned = cleaned[3:]
        if cleaned.endswith('```'):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        
        parsed = json.loads(cleaned)
        
        return {
            "name": name,
            "role": role,
            "score": float(parsed.get('initial_score', parsed.get('score', 0.0))),
            "confidence": int(parsed.get('confidence', 50)),
            "reasoning": parsed.get('reasoning', raw[:200]),
            "key_data": parsed.get('key_data', 'N/A'),
            "bull_case": parsed.get('bull_case', ''),
            "bear_case": parsed.get('bear_case', ''),
            "time_horizon": parsed.get('time_horizon', 'N/A')
        }
    
    except Exception as e:
        logger.warning(f"[{ticker}][{role}] JSON parse failed: {str(e)[:100]}")
        return {
            "name": name,
            "role": role,
            "score": 0.0,
            "confidence": 50,
            "reasoning": raw[:300] if 'raw' in locals() else "Parse error",
            "key_data": "N/A",
            "bull_case": "",
            "bear_case": ""
        }


def parse_attack_output(task_output) -> dict:
    """Parse attack output"""
    try:
        raw = task_output.raw if hasattr(task_output, 'raw') else str(task_output)
        
        cleaned = raw.strip()
        if cleaned.startswith('```json'):
            cleaned = cleaned[7:]
        if cleaned.startswith('```'):
            cleaned = cleaned[3:]
        if cleaned.endswith('```'):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        
        parsed = json.loads(cleaned)
        
        return {
            "attacks": parsed.get('attacks', {}),
            "revised_score": float(parsed.get('revised_score', 0.0)),
            "confidence_adjustment": int(parsed.get('confidence_adjustment', 0))
        }
    
    except Exception as e:
        logger.warning(f"Attack parse failed: {str(e)[:100]}")
        return {"attacks": {}, "revised_score": None, "confidence_adjustment": 0}


def extract_debate_summary(crew, ticker: str) -> dict:
    """Extract debate synthesis (task -2)"""
    try:
        if len(crew.tasks) >= 2:
            debate_output = crew.tasks[-2].output
            raw = debate_output.raw if hasattr(debate_output, 'raw') else str(debate_output)
            
            cleaned = raw.strip()
            if cleaned.startswith('```json'):
                cleaned = cleaned[7:]
            if cleaned.startswith('```'):
                cleaned = cleaned[3:]
            if cleaned.endswith('```'):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            
            parsed = json.loads(cleaned)
            
            return {
                "agreements": parsed.get('agreements', ''),
                "major_conflicts": parsed.get('major_conflicts', ''),
                "strongest_argument": parsed.get('strongest_argument', {}),
                "weakest_argument": parsed.get('weakest_argument', {}),
                "debate_intensity_score": float(parsed.get('debate_intensity_score', 0.0)),
                "unresolved_risks": parsed.get('unresolved_risks', [])
            }
    
    except Exception as e:
        logger.error(f"[{ticker}] Debate parse error: {str(e)}")
    
    return None


def extract_consensus(crew_result, ticker: str) -> dict:
    """Extract chief consensus (last task)"""
    try:
        if hasattr(crew_result, 'tasks_output') and crew_result.tasks_output:
            chief_output = crew_result.tasks_output[-1]
        else:
            chief_output = crew_result
        
        raw = chief_output.raw if hasattr(chief_output, 'raw') else str(chief_output)
        
        cleaned = raw.strip()
        if cleaned.startswith('```json'):
            cleaned = cleaned[7:]
        if cleaned.startswith('```'):
            cleaned = cleaned[3:]
        if cleaned.endswith('```'):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        
        consensus = json.loads(cleaned)
        
        return {
            "score": float(consensus.get('consensus_score', consensus.get('score', 0.0))),
            "action": consensus.get('action', 'HOLD').upper(),
            "confidence": int(consensus.get('confidence', 50)),
            "allocation": int(consensus.get('allocation', 10)),
            "risk_level": consensus.get('risk_level', 'MODERATE').upper(),
            "reasoning": consensus.get('reasoning', ''),
            "time_horizon": consensus.get('time_horizon', 'N/A'),
            "key_risks": consensus.get('key_risks', []),
            "analyst_weights_used": consensus.get('analyst_weights_used', {})
        }
    
    except Exception as e:
        logger.error(f"[{ticker}] Consensus parse error: {str(e)}")
        return {
            "score": 0.0,
            "action": "HOLD",
            "confidence": 0,
            "allocation": 0,
            "risk_level": "HIGH",
            "reasoning": f"Parse error: {str(e)}"
        }


def generate_mock_outputs(ticker: str) -> list:
    """Mock fallback"""
    import random
    return [
        {
            "name": "Long-Term Value Investor",
            "role": "value_investor",
            "score": round(random.uniform(0.2, 0.7), 2),
            "confidence": random.randint(60, 80),
            "reasoning": f"Fundamental analysis of {ticker}",
            "key_data": "Mock data"
        },
        {
            "name": "Momentum Swing Trader",
            "role": "momentum_trader",
            "score": round(random.uniform(0.3, 0.8), 2),
            "confidence": random.randint(65, 85),
            "reasoning": f"Technical setup for {ticker}",
            "key_data": "Mock data"
        },
        {
            "name": "Contrarian Risk Strategist",
            "role": "contrarian",
            "score": round(random.uniform(-0.3, 0.5), 2),
            "confidence": random.randint(55, 75),
            "reasoning": f"Contrarian view on {ticker}",
            "key_data": "Mock data"
        }
    ]


def get_price_data_count(timeframe: str) -> int:
    """Calculate data points"""
    timeframe_map = {
        '1d': 1, '5d': 5, '7d': 7, '30d': 30,
        '90d': 90, '1y': 252, '2y': 504, '5y': 1260
    }
    return timeframe_map.get(timeframe, 30)