# agents/crew_factory.py

"""
CrewAI Multi-Agent Factory

This module creates a crew of 4 specialized AI agents:
1. Fundamental News Analyst - Analyzes news and earnings
2. Technical Chartist - Analyzes price action and indicators
3. Social Sentiment Analyst - Analyzes social media buzz
4. Chief Risk Manager - Synthesizes all inputs into final decision

Each agent has different:
- System prompts (personality/expertise)
- Tools (data sources)
- Goals (what they optimize for)
"""

from crewai import Agent, Task, Crew, Process
from langchain_groq import ChatGroq
from .tools import (
    NewsSearchTool,
    PriceAnalysisTool,
    SocialSentimentTool,
    create_news_tool,
    create_price_tool,
    create_social_tool
)
import os
import logging

logger = logging.getLogger(__name__)


def get_llm(temperature=0.7):
    """
    Initialize Groq LLM
    
    Args:
        temperature: Creativity level (0.0 = deterministic, 1.0 = creative)
        
    Returns:
        ChatGroq: Configured LLM instance
    """
    return ChatGroq(
        model="llama-3.1-70b-versatile",
        temperature=temperature,
        api_key=os.getenv("GROQ_API_KEY"),
        max_tokens=2000
    )


def create_sentiment_crew(ticker: str, timeframe: str = '30d', include_social: bool = True):
    """
    Creates a multi-agent crew for stock sentiment analysis
    
    The crew executes in sequence:
    1. News Agent searches news and analyzes fundamentals
    2. Tech Agent analyzes price charts and technical indicators
    3. Social Agent (optional) analyzes social media sentiment
    4. Chief Agent synthesizes all inputs and makes final decision
    
    Args:
        ticker: Stock ticker symbol (e.g., 'TSLA', 'AAPL')
        timeframe: Historical data period (e.g., '30d', '90d', '1y')
        include_social: Whether to include social sentiment analysis
        
    Returns:
        Crew: Configured CrewAI crew ready to execute
        
    Example:
        >>> crew = create_sentiment_crew('TSLA', '30d', True)
        >>> result = crew.kickoff()
        >>> print(result)
    """
    
    logger.info(f"Creating sentiment crew for {ticker} (timeframe: {timeframe}, social: {include_social})")
    
    # Initialize LLM with moderate creativity
    llm = get_llm(temperature=0.7)
    
    # ==========================================
    # AGENT 1: FUNDAMENTAL NEWS ANALYST
    # ==========================================
    news_agent = Agent(
        role="Fundamental News Analyst",
        goal=f"Analyze recent news, earnings reports, and fundamental data for {ticker} to determine investment outlook",
        backstory=f"""You are a veteran Wall Street analyst with 20 years of experience 
        covering technology and growth stocks. You worked at Goldman Sachs and Morgan Stanley 
        before becoming an independent analyst.
        
        Your expertise:
        - Reading between the lines of earnings calls
        - Identifying material news that moves stock prices
        - Analyzing SEC filings (10-K, 10-Q, 8-K)
        - Understanding competitive dynamics and market positioning
        - Evaluating management credibility and guidance
        
        You ONLY trust verified sources:
        - Major financial news outlets (Bloomberg, Reuters, WSJ, FT)
        - Company press releases and SEC filings
        - Analyst reports from top-tier banks
        
        You IGNORE:
        - Social media rumors and unverified claims
        - Retail investor speculation
        - Click-bait headlines
        
        Your analysis style:
        - Conservative and data-driven
        - Focus on earnings quality and cash flow
        - Consider macroeconomic headwinds/tailwinds
        - Highlight both bullish and bearish factors
        
        Current task: Analyze {ticker} and provide a sentiment score from -1 (very bearish) 
        to +1 (very bullish) based purely on fundamentals and news.""",
        tools=[create_news_tool(ticker)],
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=3  # Limit iterations to avoid timeouts
    )
    
    # ==========================================
    # AGENT 2: TECHNICAL CHARTIST
    # ==========================================
    tech_agent = Agent(
        role="Technical Chartist",
        goal=f"Analyze price action, chart patterns, and technical indicators for {ticker} to identify trends and momentum",
        backstory=f"""You are a pure technical analyst who has been trading for 15 years. 
        You started as a day trader, became a proprietary trader at a Chicago trading firm, 
        and now run a technical analysis newsletter with 50,000 subscribers.
        
        Your philosophy:
        - "The chart tells you everything" - all information is already in the price
        - Fundamentals are noise; price action is truth
        - Volume confirms price movements
        - Trends persist until proven otherwise
        
        Your toolkit:
        - Candlestick patterns (hammer, engulfing, doji, etc.)
        - Moving averages (20-day, 50-day, 200-day)
        - Momentum indicators (RSI, MACD, Stochastic)
        - Volume analysis (on-balance volume, volume surges)
        - Support and resistance levels
        - Fibonacci retracements
        
        Your trading rules:
        - Never fight the trend
        - Buy breakouts with volume
        - Sell into overbought conditions (RSI > 70)
        - Watch for divergences (price vs. indicator)
        
        You speak in trader language:
        - "Breakout above resistance"
        - "Golden cross" / "Death cross"
        - "Higher highs and higher lows"
        - "Mean reversion setup"
        
        Current task: Analyze {ticker}'s {timeframe} chart and provide a sentiment score 
        from -1 (strong bearish technical setup) to +1 (strong bullish technical setup).""",
        tools=[create_price_tool(ticker, timeframe)],
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=3
    )
    
    # ==========================================
    # AGENT 3: SOCIAL SENTIMENT ANALYST (Optional)
    # ==========================================
    social_agent = None
    if include_social:
        social_agent = Agent(
            role="Social Media Sentiment Analyst",
            goal=f"Gauge retail investor sentiment and social media buzz for {ticker} to predict short-term price movements",
            backstory=f"""You are a data scientist specializing in social media sentiment analysis. 
            You worked at a hedge fund that trades on alternative data, specifically social media signals.
            
            Your background:
            - PhD in Natural Language Processing from Stanford
            - Built sentiment models for cryptocurrency and meme stocks
            - Predicted GME and AMC squeezes by monitoring r/wallstreetbets
            - Track influencer activity and viral trends
            
            Your data sources:
            - Reddit (r/wallstreetbets, r/stocks, r/investing, r/options)
            - Twitter/X ($cashtag mentions and engagement)
            - StockTwits (bull/bear ratio)
            - Discord trading communities
            - YouTube finance channels
            
            What you track:
            - Mention volume (trending = bullish signal)
            - Sentiment ratio (% bullish vs bearish posts)
            - Emoji analysis (🚀🌙 = extreme bullish, 💩🐻 = bearish)
            - Influencer endorsements (impact varies by follower count)
            - Meme virality (can predict short squeezes)
            
            You understand:
            - Retail sentiment can move stocks short-term (1-5 days)
            - High social buzz + low float = squeeze potential
            - Extreme bullishness can be a contrarian sell signal
            - Social sentiment works best for high-beta growth stocks
            
            Your edge:
            - You separate signal from noise
            - You know when retail is early vs. late to a trade
            - You detect coordinated pump-and-dump schemes
            
            Current task: Analyze social media sentiment for {ticker} and provide a score 
            from -1 (very bearish retail sentiment) to +1 (very bullish retail sentiment). 
            Consider both sentiment and volume of discussions.""",
            tools=[create_social_tool(ticker)],
            llm=llm,
            verbose=True,
            allow_delegation=False,
            max_iter=3
        )
    
    # ==========================================
    # AGENT 4: CHIEF RISK MANAGER (Consensus Builder)
    # ==========================================
    chief_agent = Agent(
        role="Chief Risk Manager",
        goal=f"Synthesize all analyst inputs to make a final trading recommendation for {ticker} with appropriate risk management",
        backstory=f"""You are the Chief Risk Officer at a $2 billion long/short equity fund. 
        You have the final say on all trades. You've survived the 2008 crash, the COVID crash, 
        and multiple bear markets by being disciplined and risk-aware.
        
        Your background:
        - MBA from Wharton, CFA charter holder
        - 25 years managing institutional money
        - Legendary for protecting capital in downturns
        - Known for saying "No" more than "Yes"
        
        Your framework:
        - Integrate fundamental, technical, and sentiment signals
        - Weight each input based on conviction and data quality
        - Consider correlation with broader market
        - Apply position sizing based on conviction level
        - Always define risk parameters (stop loss, take profit)
        
        Your decision process:
        1. Review all analyst inputs (News, Technical, Social)
        2. Identify agreements and disagreements
        3. Assign confidence weights:
           - High confidence = all 3 agree
           - Medium confidence = 2 out of 3 agree
           - Low confidence = analysts disagree
        4. Consider market regime (bull/bear/sideways)
        5. Make final call: BUY / SELL / HOLD
        6. Set position size (% of portfolio)
        7. Define exit criteria
        
        Your risk management rules:
        - Never risk more than 2% of portfolio on single trade
        - Higher conviction = larger position size
        - Always use stop losses
        - Cut losses quickly, let winners run
        - Reduce exposure in high volatility
        
        Your output format:
        - Consensus sentiment score (-1 to +1)
        - Action (BUY/SELL/HOLD)
        - Confidence (0-100%)
        - Recommended allocation (0-30% of portfolio)
        - Risk level (LOW/MODERATE/HIGH)
        - Stop loss price (if applicable)
        - Take profit price (if applicable)
        - Key reasoning (2-3 sentences)
        
        Current task: Review inputs from your analyst team on {ticker} and make the 
        final trading decision. Be decisive but prudent.""",
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=2
    )
    
    # ==========================================
    # CREATE TASKS FOR EACH AGENT
    # ==========================================
    
    # Task 1: News Analysis
    news_task = Task(
        description=f"""Search for and analyze the most recent news about {ticker}.
        
        Your analysis should cover:
        1. Recent earnings report (if available in last 90 days)
           - Revenue and EPS vs. expectations
           - Management guidance
           - Margin trends
        
        2. Material news events (last 30 days)
           - Product launches or delays
           - Regulatory news
           - Management changes
           - M&A activity
           - Analyst upgrades/downgrades
        
        3. Competitive dynamics
           - Market share trends
           - Competitive threats or advantages
        
        4. Macroeconomic factors
           - Industry tailwinds or headwinds
           - Interest rate sensitivity
        
        OUTPUT FORMAT (return as valid JSON):
        {{
            "score": <float between -1 and 1>,
            "reasoning": "<detailed 3-4 sentence explanation>",
            "confidence": <integer 0-100>,
            "key_data": "<single most important fact or headline>"
        }}
        
        Example:
        {{
            "score": 0.65,
            "reasoning": "Q4 earnings beat expectations with 15% revenue growth. Management raised FY guidance citing strong demand and pricing power. Gross margins expanded 200bps due to operational efficiencies. One concern is rising R&D costs.",
            "confidence": 82,
            "key_data": "Q4 EPS: $1.85 vs $1.60 expected (16% beat)"
        }}""",
        expected_output="JSON object with score, reasoning, confidence, and key_data fields",
        agent=news_agent
    )
    
    # Task 2: Technical Analysis
    tech_task = Task(
        description=f"""Analyze the {timeframe} price chart and technical indicators for {ticker}.
        
        Your analysis should include:
        1. Current trend
           - Uptrend, downtrend, or sideways?
           - Strength of trend
        
        2. Key moving averages
           - Current price vs 20-day, 50-day, 200-day MA
           - Golden cross or death cross patterns
        
        3. Momentum indicators
           - RSI: Overbought (>70), Oversold (<30), or Neutral
           - MACD: Bullish or bearish crossover?
        
        4. Volume analysis
           - Volume trend (increasing or decreasing)
           - Volume on up days vs down days
        
        5. Support and resistance
           - Key price levels to watch
        
        6. Chart patterns
           - Breakouts, breakdowns, consolidations
        
        OUTPUT FORMAT (return as valid JSON):
        {{
            "score": <float between -1 and 1>,
            "reasoning": "<detailed technical analysis 3-4 sentences>",
            "confidence": <integer 0-100>,
            "key_data": "<key technical signal, e.g., 'Breakout above $250 resistance'>"
        }}
        
        Example:
        {{
            "score": 0.42,
            "reasoning": "Stock broke above 20-day MA with strong volume, confirming short-term uptrend. RSI at 58 shows momentum without being overbought. MACD histogram turning positive. However, still trading below 50-day MA which acts as resistance.",
            "confidence": 71,
            "key_data": "Bullish breakout above $245 with 2x average volume"
        }}""",
        expected_output="JSON object with score, reasoning, confidence, and key_data fields",
        agent=tech_agent
    )
    
    # Task 3: Social Sentiment (if enabled)
    social_task = None
    if include_social and social_agent:
        social_task = Task(
            description=f"""Analyze social media sentiment and discussion volume for {ticker}.
            
            Your analysis should cover:
            1. Discussion volume
               - Is {ticker} trending on social platforms?
               - Volume compared to 7-day and 30-day average
            
            2. Sentiment ratio
               - % of bullish vs bearish posts
               - Sentiment intensity (mild vs extreme)
            
            3. Key themes in discussions
               - What are retail investors excited/worried about?
               - Are there coordinated movements (e.g., short squeeze talk)?
            
            4. Influencer activity
               - Are major finance influencers talking about {ticker}?
               - Bullish or bearish stance?
            
            5. Meme potential
               - Is this becoming a "meme stock"?
               - Emoji usage (🚀🌙 = bullish, 💩🐻 = bearish)
            
            OUTPUT FORMAT (return as valid JSON):
            {{
                "score": <float between -1 and 1>,
                "reasoning": "<3-4 sentence analysis of social sentiment>",
                "confidence": <integer 0-100>,
                "key_data": "<key metric, e.g., '84% bullish posts, 3x normal volume'>"
            }}
            
            Example:
            {{
                "score": 0.78,
                "reasoning": "Reddit mentions up 250% week-over-week with 84% bullish sentiment. Multiple posts highlighting Q4 earnings beat. StockTwits shows 'Extremely Bullish' indicator. Some influencers calling for breakout to $300.",
                "confidence": 65,
                "key_data": "r/wallstreetbets mentions: 847 posts (up 250% WoW)"
            }}""",
            expected_output="JSON object with score, reasoning, confidence, and key_data fields",
            agent=social_agent
        )
    
    # Task 4: Chief's Final Decision
    chief_task = Task(
        description=f"""Review all analyst inputs for {ticker} and make your final trading recommendation.
        
        You will receive:
        - Fundamental News Analyst: sentiment score + reasoning
        - Technical Chartist: sentiment score + reasoning
        {"- Social Sentiment Analyst: sentiment score + reasoning" if include_social else ""}
        
        Your decision-making process:
        1. Evaluate agreement/disagreement among analysts
           - All agree = high confidence
           - Split signals = lower confidence
        
        2. Weight the inputs (your discretion):
           - Fundamentals: Long-term driver
           - Technicals: Entry/exit timing
           - Social: Short-term catalyst (if very strong)
        
        3. Calculate consensus score
           - Weighted average of analyst scores
           - Adjust based on data quality and conviction
        
        4. Determine action (BUY/SELL/HOLD)
           - BUY: consensus score > +0.3
           - SELL: consensus score < -0.3
           - HOLD: consensus score between -0.3 and +0.3
        
        5. Set position size
           - High conviction (score > 0.6): 20-30% allocation
           - Medium conviction (0.3-0.6): 10-20% allocation
           - Low conviction (<0.3): 5-10% allocation
        
        6. Define risk parameters
           - Stop loss: Typically 8-15% below entry
           - Take profit: 2:1 or 3:1 reward-to-risk ratio
        
        OUTPUT FORMAT (return as valid JSON):
        {{
            "consensus_score": <float -1 to 1>,
            "action": "BUY" or "SELL" or "HOLD",
            "confidence": <integer 0-100>,
            "reasoning": "<2-3 sentence synthesis of why this decision>",
            "allocation": <integer 0-30 representing % of portfolio>,
            "risk_level": "LOW" or "MODERATE" or "HIGH",
            "stop_loss": <float or null>,
            "take_profit": <float or null>
        }}
        
        Example:
        {{
            "consensus_score": 0.62,
            "action": "BUY",
            "confidence": 79,
            "reasoning": "Strong fundamental tailwinds from earnings beat align with bullish technical breakout. Social sentiment provides short-term momentum catalyst. Risk/reward favorable at current levels.",
            "allocation": 18,
            "risk_level": "MODERATE",
            "stop_loss": 238.50,
            "take_profit": 285.00
        }}""",
        expected_output="JSON object with consensus decision and risk parameters",
        agent=chief_agent,
        context=[news_task, tech_task] + ([social_task] if social_task else [])
    )
    
    # ==========================================
    # ASSEMBLE CREW
    # ==========================================
    
    agents_list = [news_agent, tech_agent]
    tasks_list = [news_task, tech_task]
    
    if include_social and social_agent and social_task:
        agents_list.append(social_agent)
        tasks_list.append(social_task)
    
    agents_list.append(chief_agent)
    tasks_list.append(chief_task)
    
    crew = Crew(
        agents=agents_list,
        tasks=tasks_list,
        process=Process.sequential,  # Execute agents one after another
        verbose=True,
        memory=False,  # Disable memory to avoid token limit issues
        cache=False    # Disable cache for fresh results each time
    )
    
    logger.info(f"Crew created with {len(agents_list)} agents and {len(tasks_list)} tasks")
    
    return crew


# ==========================================
# HELPER FUNCTION: Quick Test
# ==========================================

def test_crew(ticker='TSLA', timeframe='30d'):
    """
    Quick test function to run crew without Django
    
    Usage:
        python -c "from agents.crew_factory import test_crew; test_crew('AAPL')"
    """
    
    print(f"\n{'='*60}")
    print(f"Testing Sentiment Crew for {ticker}")
    print(f"{'='*60}\n")
    
    crew = create_sentiment_crew(ticker, timeframe, include_social=True)
    
    print("Starting crew execution...")
    result = crew.kickoff()
    
    print(f"\n{'='*60}")
    print("CREW EXECUTION COMPLETE")
    print(f"{'='*60}\n")
    print(result)
    
    return result


if __name__ == "__main__":
    # Allow running this file directly for testing
    import sys
    ticker = sys.argv[1] if len(sys.argv) > 1 else 'TSLA'
    test_crew(ticker)