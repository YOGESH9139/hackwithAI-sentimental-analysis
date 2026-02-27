# agents/crew_factory.py

"""
Multi-Agent Stock Analysis with Debate Architecture

Architecture:
Stage 1: Web Surfer - Fetches ALL data once
Stage 2: Three Independent Analysts (no cross-talk)
   - Long-Term Value Investor
   - Momentum Swing Trader
   - Contrarian Risk Hedge
Stage 3: Cross-Attack Phase (each agent attacks others)
Stage 4: Debate Synthesis (evaluates debate quality)
Stage 5: Final Consensus (Chief makes decision after debate)
"""

from crewai import Agent, Task, Crew, Process
from langchain_google_genai import ChatGoogleGenerativeAI
from .tools import WebSurferTool, DatasetReaderTool
import os
import logging

logger = logging.getLogger(__name__)


def get_llm(temperature=0.7):
    """Initialize Gemini LLM"""
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-pro",  # or gemini-2.5-pro if available in your account
        temperature=temperature,
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        max_output_tokens=2000,
    )

def create_sentiment_crew(ticker: str, timeframe: str = '30d', include_social: bool = True):
    """
    Creates multi-agent crew with debate architecture
    
    Flow:
    1. Web Surfer → Dataset
    2. 3 Independent Analysts → Initial Scores
    3. Cross-Attack Phase → Attack Outputs
    4. Debate Synthesis → Quality Evaluation
    5. Chief Consensus → Final Decision
    
    Args:
        ticker: Stock ticker symbol
        timeframe: Historical data period
        include_social: Include social sentiment
        
    Returns:
        Crew: Configured CrewAI crew
    """
    
    logger.info(f"Creating debate crew for {ticker}")
    logger.info(f"Architecture: Surfer → 3 Analysts → Cross-Attack → Debate → Chief")
    
    llm = get_llm(temperature=0.7)
    
    # ==========================================
    # STAGE 1: WEB SURFER (Data Collection)
    # ==========================================
    web_surfer = Agent(
        role="Web Surfer & Data Collector",
        goal=f"Fetch ALL relevant data for {ticker} in one pass and structure it",
        backstory="""You are a data collection specialist. Your only job is to gather 
        information efficiently - NOT to analyze or interpret it.
        
        You fetch:
        - Financial news and earnings data
        - Price history and technical indicators
        - Social media sentiment data
        
        You structure everything into clean JSON for downstream analysts.
        You do NOT make judgments or recommendations.""",
        tools=[WebSurferTool(ticker=ticker, timeframe=timeframe, include_social=include_social)],
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=2
    )
    
    # ==========================================
    # STAGE 2: ANALYST 1 - LONG-TERM VALUE INVESTOR
    # ==========================================
    value_investor = Agent(
        role="Long-Term Value Investor",
        goal=f"Evaluate whether {ticker} is a fundamentally strong long-term investment regardless of short-term volatility",
        backstory="""You are a Buffett-style value investor with 25 years managing capital.
        
        Your philosophy:
        - "If I can't hold it 5 years, I don't want it 5 minutes"
        - Price is what you pay, value is what you get
        - Mr. Market is bipolar - you exploit his emotions, not follow them
        - Moats matter more than momentum
        
        You survived:
        - 2008 financial crisis (bought when others panicked)
        - Dot-com bubble (avoided the hype)
        - COVID crash (accumulated quality at discounts)
        
        What you care about:
        - Sustainable competitive advantages
        - Management quality and capital allocation
        - Free cash flow generation
        - Balance sheet strength
        - Earnings quality (not just EPS beats)
        
        What you IGNORE:
        - Short-term price movements
        - Social media hype
        - Momentum signals
        - Technical patterns
        
        Your biases:
        - Discount social sentiment heavily (-50% weight)
        - Skeptical of "hot stocks"
        - Prefer boring, predictable businesses
        - Think most traders overreact
        
        You are CONSERVATIVE and patient. You'd rather miss 10 opportunities than make 1 mistake.""",
        tools=[DatasetReaderTool()],
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=2
    )
    
    # ==========================================
    # STAGE 2: ANALYST 2 - MOMENTUM SWING TRADER
    # ==========================================
    momentum_trader = Agent(
        role="Momentum Swing Trader",
        goal=f"Identify short-to-medium term price opportunities in {ticker} based on momentum and technical positioning",
        backstory="""You are a former proprietary trader at a Chicago firm. You trade 1-4 week swings.
        
        Your philosophy:
        - "Trend is king, everything else is noise"
        - Price action discounts all information
        - Ride momentum until it breaks
        - Cut losses fast, let winners run
        
        Your edge:
        - You read charts like a book
        - You smell breakouts before they happen
        - You understand volume tells the truth
        - You know when institutions are accumulating
        
        What you care about:
        - Price breaking key levels
        - Volume surges confirming moves
        - RSI and MACD momentum
        - Social buzz as a short-term catalyst
        - Relative strength vs market
        
        What you IGNORE:
        - Long-term fundamentals
        - P/E ratios and balance sheets
        - Whether the company will exist in 5 years
        - Value investor opinions
        
        Your biases:
        - Social spikes = trading opportunity
        - Earnings only matter if they move price
        - Fundamentals are backward-looking
        - Technical setups > everything
        
        You are AGGRESSIVE and conviction-driven. You'd rather be wrong fast than right slow.""",
        tools=[DatasetReaderTool()],
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=2
    )
    
    # ==========================================
    # STAGE 2: ANALYST 3 - CONTRARIAN RISK HEDGE
    # ==========================================
    contrarian = Agent(
        role="Contrarian Risk Strategist",
        goal=f"Identify hidden risks and overconfidence in current market positioning of {ticker}",
        backstory="""You are a former macro hedge fund analyst who specializes in tail risks.
        
        Your philosophy:
        - "If everyone agrees, someone is wrong"
        - Markets overreact to everything
        - The crowd is right during trends, wrong at extremes
        - Asymmetry > conviction
        
        Your track record:
        - Called the 2021 meme stock reversal
        - Warned about crypto leverage in 2022
        - Profited from COVID volatility spikes
        
        What you hunt for:
        - Crowded trades
        - Overconfidence signals
        - Hidden leverage
        - Sentiment extremes
        - Positioning imbalances
        
        Your contrarian signals:
        - High social bullishness = bearish
        - Extreme technical breakouts = mean reversion setup
        - Everyone bullish = time to fade
        - Universal bearishness = buying opportunity
        
        What you analyze:
        - Put/call ratios
        - Social sentiment extremes
        - Technical overbought/oversold
        - Fundamental disconnects from price
        
        Your biases:
        - You LOVE disagreement
        - You distrust consensus
        - You think most analysts are sheep
        - You believe volatility = opportunity
        
        You are SKEPTICAL and risk-focused. You'd rather miss gains than ignore warnings.""",
        tools=[DatasetReaderTool()],
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=2
    )
    
    # ==========================================
    # STAGE 4: DEBATE SYNTHESIS AGENT
    # ==========================================
    debate_moderator = Agent(
        role="Debate Quality Evaluator",
        goal=f"Evaluate the quality and intensity of debate between analysts on {ticker}",
        backstory="""You are a debate judge and critical thinking expert.
        
        Your job is NOT to pick winners. Your job is to evaluate argumentation quality.
        
        You assess:
        - Strength of evidence presented
        - Logical consistency
        - Identification of weaknesses in opposing views
        - Quality of counterarguments
        - Confidence calibration
        
        You identify:
        - Where analysts agree (convergent signals)
        - Where they conflict (divergent signals)
        - Whose argument is most data-driven
        - Whose argument has the most holes
        - Which risks are unresolved
        
        You measure:
        - Debate intensity (how much disagreement)
        - Confidence shifts after cross-examination
        - Strength of consensus (if any)
        
        You DO NOT make trading decisions. You provide meta-analysis of the debate.""",
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=2
    )
    
    # ==========================================
    # STAGE 5: CHIEF RISK MANAGER
    # ==========================================
    chief = Agent(
        role="Chief Risk Manager",
        goal=f"Make final trading decision on {ticker} after reviewing full debate",
        backstory="""You are the CRO at a $2B long/short fund. You have the final word.
        
        You receive:
        - 3 initial analyst views
        - Cross-attack outputs
        - Debate quality evaluation
        - Revised confidence scores
        
        Your decision framework:
        1. Weight analyst inputs based on:
           - Strength of argumentation
           - Quality of evidence
           - Historical accuracy (you know their biases)
        
        2. Resolve conflicts:
           - When Value + Contrarian agree → strong signal
           - When Momentum isolated → fade or reduce size
           - When all three agree → rare, high conviction
           - When all three disagree → HOLD
        
        3. Adjust for debate quality:
           - Weak debate = lower confidence
           - Strong attacks = increase skepticism
           - Unresolved risks = reduce allocation
        
        Your weighting heuristic:
        - Value Investor: 35% (long-term anchor)
        - Momentum Trader: 30% (timing signal)
        - Contrarian: 25% (risk check)
        - Debate Quality: 10% (confidence adjustment)
        
        You are DECISIVE but PRUDENT. Capital preservation > FOMO.""",
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=2
    )
    
    # ==========================================
    # TASKS
    # ==========================================
    
    # Task 1: Web Surfer Data Collection
    surfer_task = Task(
        description=f"""Fetch and structure ALL data for {ticker}.
        
        Collect:
        1. News data (last 30 days): headlines, summaries, sources
        2. Price data ({timeframe}): OHLC, MAs, RSI, MACD, volume
        3. Social data: sentiment score, mention volume, trending topics
        
        OUTPUT: JSON dataset with all three sections.
        Store this - other agents will read from it.""",
        expected_output="JSON dataset with news_data, price_data, social_data",
        agent=web_surfer
    )
    
    # Task 2: Value Investor Initial Analysis
    value_task = Task(
        description=f"""Read the dataset and analyze {ticker} as a LONG-TERM VALUE INVESTMENT.
        
        Focus on:
        - Business quality and competitive moat
        - Financial health (balance sheet, cash flow)
        - Management track record
        - Sustainable earnings power
        - Valuation relative to intrinsic value
        
        IGNORE short-term price action and social hype.
        
        OUTPUT (valid JSON):
        {{
            "agent": "value_investor",
            "initial_score": <float -1 to 1>,
            "confidence": <int 0-100>,
            "reasoning": "<3-4 sentences on fundamental quality>",
            "bull_case": "<strongest long-term positive>",
            "bear_case": "<biggest fundamental risk>",
            "key_data": "<most important metric>",
            "time_horizon": "3-5 years"
        }}""",
        expected_output="JSON with value investment analysis",
        agent=value_investor,
        context=[surfer_task]
    )
    
    # Task 3: Momentum Trader Initial Analysis
    momentum_task = Task(
        description=f"""Read the dataset and analyze {ticker} as a MOMENTUM SWING TRADE.
        
        Focus on:
        - Price trend and breakout potential
        - Technical indicator alignment (RSI, MACD)
        - Volume confirmation
        - Social buzz as short-term catalyst
        - Relative strength
        
        IGNORE fundamental valuation and long-term concerns.
        
        OUTPUT (valid JSON):
        {{
            "agent": "momentum_trader",
            "initial_score": <float -1 to 1>,
            "confidence": <int 0-100>,
            "reasoning": "<3-4 sentences on technical setup>",
            "bull_case": "<strongest momentum signal>",
            "bear_case": "<biggest technical risk>",
            "key_data": "<key price level or indicator>",
            "time_horizon": "1-4 weeks"
        }}""",
        expected_output="JSON with momentum analysis",
        agent=momentum_trader,
        context=[surfer_task]
    )
    
    # Task 4: Contrarian Initial Analysis
    contrarian_task = Task(
        description=f"""Read the dataset and analyze {ticker} for CONTRARIAN OPPORTUNITIES/RISKS.
        
        Focus on:
        - Sentiment extremes (too bullish = bearish signal)
        - Crowded positioning
        - Technical overbought/oversold
        - Disconnects between price and fundamentals
        - Hidden tail risks
        
        Be SKEPTICAL. Look for what others are missing.
        
        OUTPUT (valid JSON):
        {{
            "agent": "contrarian",
            "initial_score": <float -1 to 1>,
            "confidence": <int 0-100>,
            "reasoning": "<3-4 sentences on contrarian view>",
            "bull_case": "<contrarian opportunity if any>",
            "bear_case": "<contrarian risk or warning>",
            "key_data": "<key contrarian signal>",
            "positioning": "CROWDED_LONG" or "CROWDED_SHORT" or "BALANCED"
        }}""",
        expected_output="JSON with contrarian analysis",
        agent=contrarian,
        context=[surfer_task]
    )
    
    # Task 5: Value Investor Cross-Attack
    value_attack_task = Task(
        description=f"""You've seen the other two analysts' outputs. Now ATTACK their logic.
        
        You have:
        - Momentum Trader's analysis (overweights technicals, ignores fundamentals)
        - Contrarian's analysis (overly skeptical, may miss obvious value)
        
        Challenge them:
        - Why is the Momentum Trader wrong to ignore fundamentals?
        - Why is the Contrarian too pessimistic or missing the bigger picture?
        - What are they overlooking that you see?
        
        OUTPUT (valid JSON):
        {{
            "agent": "value_investor",
            "attacks": {{
                "momentum_trader": {{
                    "weaknesses": "<specific flaws in their argument>",
                    "missing_factors": "<what they ignored>",
                    "why_value_wins": "<why fundamentals matter more>"
                }},
                "contrarian": {{
                    "weaknesses": "<specific flaws in their argument>",
                    "missing_factors": "<what they ignored>",
                    "why_value_wins": "<why their skepticism is misplaced>"
                }}
            }},
            "revised_score": <float -1 to 1, after considering attacks>,
            "confidence_adjustment": <int -20 to +20>
        }}""",
        expected_output="JSON with value investor's attacks",
        agent=value_investor,
        context=[value_task, momentum_task, contrarian_task]
    )
    
    # Task 6: Momentum Trader Cross-Attack
    momentum_attack_task = Task(
        description=f"""You've seen the other two analysts' outputs. Now ATTACK their logic.
        
        You have:
        - Value Investor's analysis (too slow, misses momentum)
        - Contrarian's analysis (overly negative, fights the trend)
        
        Challenge them:
        - Why is the Value Investor wrong to ignore price action?
        - Why is the Contrarian wrong to fight momentum?
        - What are they missing that the chart is screaming?
        
        OUTPUT (valid JSON):
        {{
            "agent": "momentum_trader",
            "attacks": {{
                "value_investor": {{
                    "weaknesses": "<why fundamentals are too slow>",
                    "missing_factors": "<price signals they ignore>",
                    "why_momentum_wins": "<why trend > value>"
                }},
                "contrarian": {{
                    "weaknesses": "<why fighting the trend is dumb>",
                    "missing_factors": "<momentum they're ignoring>",
                    "why_momentum_wins": "<why the trend will continue>"
                }}
            }},
            "revised_score": <float -1 to 1>,
            "confidence_adjustment": <int -20 to +20>
        }}""",
        expected_output="JSON with momentum trader's attacks",
        agent=momentum_trader,
        context=[value_task, momentum_task, contrarian_task]
    )
    
    # Task 7: Contrarian Cross-Attack
    contrarian_attack_task = Task(
        description=f"""You've seen the other two analysts' outputs. Now ATTACK their logic.
        
        You have:
        - Value Investor's analysis (too optimistic, ignores risks)
        - Momentum Trader's analysis (chasing, ignoring overextension)
        
        Challenge them:
        - Why is the Value Investor underestimating risks?
        - Why is the Momentum Trader chasing a topped-out move?
        - What red flags are they both missing?
        
        OUTPUT (valid JSON):
        {{
            "agent": "contrarian",
            "attacks": {{
                "value_investor": {{
                    "weaknesses": "<risks they're ignoring>",
                    "missing_factors": "<negative signals>",
                    "why_contrarian_wins": "<why caution is warranted>"
                }},
                "momentum_trader": {{
                    "weaknesses": "<why they're chasing>",
                    "missing_factors": "<reversal signals>",
                    "why_contrarian_wins": "<why momentum will fail>"
                }}
            }},
            "revised_score": <float -1 to 1>,
            "confidence_adjustment": <int -20 to +20>
        }}""",
        expected_output="JSON with contrarian's attacks",
        agent=contrarian,
        context=[value_task, momentum_task, contrarian_task]
    )
    
    # Task 8: Debate Synthesis
    debate_task = Task(
        description=f"""Evaluate the debate quality between the three analysts on {ticker}.
        
        You have:
        - 3 initial analyses with scores
        - 3 cross-attack outputs
        
        Analyze:
        1. Where do they agree? (convergent signals)
        2. Where do they conflict? (divergent signals)
        3. Whose attacks were strongest?
        4. Whose arguments had the most holes?
        5. How much did confidence shift after attacks?
        
        OUTPUT (valid JSON):
        {{
            "agreements": "<where analysts align>",
            "major_conflicts": "<key disagreements>",
            "strongest_argument": {{
                "agent": "<value_investor|momentum_trader|contrarian>",
                "reason": "<why their case is strongest>"
            }},
            "weakest_argument": {{
                "agent": "<value_investor|momentum_trader|contrarian>",
                "reason": "<why their case is weakest>"
            }},
            "confidence_shifts": {{
                "value_investor": <int -20 to +20>,
                "momentum_trader": <int -20 to +20>,
                "contrarian": <int -20 to +20>
            }},
            "debate_intensity_score": <float 0 to 1>,
            "unresolved_risks": ["risk 1", "risk 2"]
        }}""",
        expected_output="JSON with debate evaluation",
        agent=debate_moderator,
        context=[
            value_task, momentum_task, contrarian_task,
            value_attack_task, momentum_attack_task, contrarian_attack_task
        ]
    )
    
    # Task 9: Chief Final Decision
    chief_task = Task(
        description=f"""Make final trading decision on {ticker} after reviewing full debate.
        
        You have:
        - 3 initial scores + reasoning
        - 3 attack outputs with revised scores
        - Debate synthesis with quality evaluation
        
        Decision logic:
        1. Apply weights:
           - Value Investor: 35%
           - Momentum Trader: 30%
           - Contrarian: 25%
           - Debate Quality: 10%
        
        2. Adjust for agreement:
           - All 3 agree → high confidence
           - 2 vs 1 → moderate confidence
           - All disagree → HOLD
        
        3. Factor in attacks:
           - Strong attacks reduce target's weight
           - Weak defenses reduce confidence
        
        4. Consider time horizon conflicts:
           - Value (3-5yr) vs Momentum (1-4wk) → different games
           - Reconcile or choose dominant timeframe
        
        OUTPUT (valid JSON):
        {{
            "consensus_score": <float -1 to 1>,
            "action": "BUY" or "SELL" or "HOLD",
            "confidence": <int 0-100>,
            "reasoning": "<2-3 sentence final decision>",
            "allocation": <int 0-30>,
            "risk_level": "LOW" or "MODERATE" or "HIGH",
            "stop_loss": <float or null>,
            "take_profit": <float or null>,
            "time_horizon": "<dominant timeframe>",
            "key_risks": ["risk 1", "risk 2"],
            "analyst_weights_used": {{
                "value_investor": <float 0-1>,
                "momentum_trader": <float 0-1>,
                "contrarian": <float 0-1>
            }}
        }}""",
        expected_output="JSON with final consensus",
        agent=chief,
        context=[
            value_task, momentum_task, contrarian_task,
            value_attack_task, momentum_attack_task, contrarian_attack_task,
            debate_task
        ]
    )
    
    # ==========================================
    # ASSEMBLE CREW
    # ==========================================
    
    agents_list = [
        web_surfer,
        value_investor,
        momentum_trader,
        contrarian
    ]
    
    tasks_list = [
        surfer_task,
        value_task,
        momentum_task,
        contrarian_task,
        value_attack_task,
        momentum_attack_task,
        contrarian_attack_task
    ]
    
    agents_list.extend([debate_moderator, chief])
    tasks_list.extend([debate_task, chief_task])
    
    crew = Crew(
        agents=agents_list,
        tasks=tasks_list,
        process=Process.sequential,
        verbose=True,
        memory=False,
        cache=False
    )
    
    logger.info(f"Debate crew created: {len(agents_list)} agents, {len(tasks_list)} tasks")
    logger.info(f"Flow: Surfer → 3 Analysts → 3 Attacks → Debate → Chief")
    
    return crew


def test_crew(ticker='TSLA', timeframe='30d'):
    """Test function"""
    print(f"\n{'='*60}")
    print(f"Testing Debate Crew for {ticker}")
    print(f"{'='*60}\n")
    
    crew = create_sentiment_crew(ticker, timeframe, include_social=True)
    result = crew.kickoff()
    
    print(f"\n{'='*60}")
    print("EXECUTION COMPLETE")
    print(f"{'='*60}\n")
    print(result)
    
    return result


if __name__ == "__main__":
    import sys
    ticker = sys.argv[1] if len(sys.argv) > 1 else 'TSLA'
    test_crew(ticker)