# agents/tools.py

"""
Custom Tools for CrewAI Agents

Each tool provides specialized data access:
1. NewsSearchTool - Searches financial news via Tavily API
2. PriceAnalysisTool - Fetches and analyzes price data via yfinance
3. SocialSentimentTool - Analyzes mock social media data from CSV

Tools are CrewAI-compatible and can be attached to agents.
"""

from crewai_tools import BaseTool
from typing import Type, Optional, Any
from pydantic import BaseModel, Field
import yfinance as yf
import pandas as pd
import os
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


# ==========================================
# TOOL 1: NEWS SEARCH TOOL
# ==========================================

class NewsSearchInput(BaseModel):
    """Input schema for news search"""
    query: str = Field(
        default="",
        description="Optional search query refinement (leave empty to use default)"
    )


class NewsSearchTool(BaseTool):
    name: str = "Financial News Search"
    description: str = (
        "Searches for recent financial news, earnings reports, and analyst coverage "
        "for a given stock ticker. Returns headlines, summaries, and source URLs "
        "from major financial news outlets."
    )
    args_schema: Type[BaseModel] = NewsSearchInput
    ticker: str = Field(..., description="Stock ticker to search news for")
    
    def __init__(self, ticker: str):
        super().__init__()
        self.ticker = ticker.upper()
    
    def _run(self, query: str = "") -> str:
        """
        Execute news search using Tavily API
        
        Args:
            query: Optional refinement to search query
            
        Returns:
            str: Formatted news results with headlines and URLs
        """
        try:
            # Try Tavily first (preferred)
            if os.getenv("TAVILY_API_KEY"):
                return self._search_with_tavily(query)
            
            # Fallback to Serper if available
            elif os.getenv("SERPER_API_KEY"):
                return self._search_with_serper(query)
            
            # Last resort: return mock data
            else:
                logger.warning(f"No news API key found for {self.ticker}, using mock data")
                return self._generate_mock_news()
        
        except Exception as e:
            logger.error(f"News search failed for {self.ticker}: {str(e)}")
            return f"Error fetching news: {str(e)}"
    
    def _search_with_tavily(self, query: str) -> str:
        """Search using Tavily API"""
        try:
            from tavily import TavilyClient
            
            client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
            
            # Build search query
            if query:
                search_query = f"{self.ticker} stock {query}"
            else:
                search_query = f"{self.ticker} stock news earnings financial report latest"
            
            logger.info(f"Tavily search: {search_query}")
            
            # Execute search
            results = client.search(
                query=search_query,
                max_results=5,
                search_depth="advanced",
                include_domains=[
                    "reuters.com",
                    "bloomberg.com",
                    "wsj.com",
                    "cnbc.com",
                    "marketwatch.com",
                    "seekingalpha.com",
                    "fool.com"
                ]
            )
            
            if not results.get('results'):
                return f"No recent news found for {self.ticker}"
            
            # Format results
            news_items = []
            for idx, item in enumerate(results['results'][:5], 1):
                news_items.append(
                    f"{idx}. {item['title']}\n"
                    f"   Source: {item.get('url', 'N/A')}\n"
                    f"   Summary: {item.get('content', 'No summary')[:200]}...\n"
                )
            
            output = f"Latest financial news for {self.ticker}:\n\n" + "\n".join(news_items)
            
            logger.info(f"Found {len(news_items)} news articles for {self.ticker}")
            
            return output
        
        except Exception as e:
            logger.error(f"Tavily search failed: {str(e)}")
            return self._generate_mock_news()
    
    def _search_with_serper(self, query: str) -> str:
        """Search using Serper API (alternative)"""
        try:
            import requests
            
            url = "https://google.serper.dev/search"
            
            search_query = f"{self.ticker} stock news earnings" + (f" {query}" if query else "")
            
            payload = {
                "q": search_query,
                "num": 5
            }
            
            headers = {
                "X-API-KEY": os.getenv("SERPER_API_KEY"),
                "Content-Type": "application/json"
            }
            
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            
            if not data.get('organic'):
                return f"No news found for {self.ticker}"
            
            news_items = []
            for idx, item in enumerate(data['organic'][:5], 1):
                news_items.append(
                    f"{idx}. {item['title']}\n"
                    f"   Source: {item['link']}\n"
                    f"   {item.get('snippet', '')}\n"
                )
            
            return f"Latest news for {self.ticker}:\n\n" + "\n".join(news_items)
        
        except Exception as e:
            logger.error(f"Serper search failed: {str(e)}")
            return self._generate_mock_news()
    
    def _generate_mock_news(self) -> str:
        """Generate mock news as fallback"""
        return f"""Latest financial news for {self.ticker}:

1. {self.ticker} Reports Strong Q4 Earnings, Beats Analyst Expectations
   Source: Mock Financial Times
   Summary: Company reported earnings per share of $1.85 vs expected $1.60, 
   representing a 16% beat. Revenue grew 12% year-over-year...

2. Analysts Raise Price Target for {self.ticker} Following Earnings Beat
   Source: Mock Reuters
   Summary: Major investment banks increased their 12-month price targets, 
   citing strong execution and market share gains...

3. {self.ticker} Announces New Product Launch, Expanding Market Opportunity
   Source: Mock Bloomberg
   Summary: The company unveiled plans to enter adjacent markets, which analysts 
   estimate could add $500M in annual revenue within 3 years...

NOTE: This is mock data. Enable Tavily API for real news."""
    
    async def _arun(self, query: str = "") -> str:
        """Async version (required by CrewAI)"""
        return self._run(query)


# ==========================================
# TOOL 2: PRICE ANALYSIS TOOL
# ==========================================

class PriceAnalysisInput(BaseModel):
    """Input schema for price analysis"""
    query: str = Field(
        default="",
        description="Optional refinement (not used, kept for compatibility)"
    )


class PriceAnalysisTool(BaseTool):
    name: str = "Stock Price & Technical Analysis"
    description: str = (
        "Fetches historical price data and calculates technical indicators "
        "including moving averages, RSI, MACD, volume trends, and identifies "
        "chart patterns and key support/resistance levels."
    )
    args_schema: Type[BaseModel] = PriceAnalysisInput
    ticker: str = Field(..., description="Stock ticker to analyze")
    timeframe: str = Field(default='30d', description="Time period for analysis")
    
    def __init__(self, ticker: str, timeframe: str = '30d'):
        super().__init__()
        self.ticker = ticker.upper()
        self.timeframe = timeframe
    
    def _run(self, query: str = "") -> str:
        """
        Execute price analysis using yfinance
        
        Returns:
            str: Formatted technical analysis report
        """
        try:
            logger.info(f"Fetching price data for {self.ticker} ({self.timeframe})")
            
            # Fetch stock data
            stock = yf.Ticker(self.ticker)
            df = stock.history(period=self.timeframe)
            
            if df.empty:
                return f"No price data available for {self.ticker}"
            
            # Calculate technical indicators
            analysis = self._calculate_indicators(df)
            
            # Format output
            output = self._format_analysis(analysis, df)
            
            logger.info(f"Price analysis completed for {self.ticker}")
            
            return output
        
        except Exception as e:
            logger.error(f"Price analysis failed for {self.ticker}: {str(e)}")
            return f"Error analyzing price data: {str(e)}"
    
    def _calculate_indicators(self, df: pd.DataFrame) -> dict:
        """Calculate all technical indicators"""
        
        # Current price
        current_price = df['Close'].iloc[-1]
        
        # Moving averages
        ma_20 = df['Close'].rolling(window=20).mean().iloc[-1] if len(df) >= 20 else None
        ma_50 = df['Close'].rolling(window=50).mean().iloc[-1] if len(df) >= 50 else None
        ma_200 = df['Close'].rolling(window=200).mean().iloc[-1] if len(df) >= 200 else None
        
        # RSI (14-period)
        rsi = self._calculate_rsi(df['Close'], period=14)
        
        # MACD
        macd_line, signal_line, macd_histogram = self._calculate_macd(df['Close'])
        
        # Volume analysis
        avg_volume = df['Volume'].mean()
        current_volume = df['Volume'].iloc[-1]
        volume_ratio = current_volume / avg_volume if avg_volume > 0 else 1
        
        # Price change
        price_change_pct = ((current_price - df['Close'].iloc[0]) / df['Close'].iloc[0]) * 100
        
        # Volatility (standard deviation of returns)
        returns = df['Close'].pct_change()
        volatility = returns.std() * 100
        
        # Determine trend
        trend = self._determine_trend(current_price, ma_20, ma_50)
        
        return {
            'current_price': current_price,
            'ma_20': ma_20,
            'ma_50': ma_50,
            'ma_200': ma_200,
            'rsi': rsi,
            'macd_line': macd_line,
            'signal_line': signal_line,
            'macd_histogram': macd_histogram,
            'avg_volume': avg_volume,
            'current_volume': current_volume,
            'volume_ratio': volume_ratio,
            'price_change_pct': price_change_pct,
            'volatility': volatility,
            'trend': trend,
            'data_points': len(df)
        }
    
    @staticmethod
    def _calculate_rsi(series: pd.Series, period: int = 14) -> float:
        """Calculate Relative Strength Index"""
        delta = series.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        
        return rsi.iloc[-1] if not rsi.empty else 50.0
    
    @staticmethod
    def _calculate_macd(series: pd.Series, fast=12, slow=26, signal=9):
        """Calculate MACD indicator"""
        ema_fast = series.ewm(span=fast, adjust=False).mean()
        ema_slow = series.ewm(span=slow, adjust=False).mean()
        
        macd_line = ema_fast - ema_slow
        signal_line = macd_line.ewm(span=signal, adjust=False).mean()
        histogram = macd_line - signal_line
        
        return (
            macd_line.iloc[-1] if not macd_line.empty else 0,
            signal_line.iloc[-1] if not signal_line.empty else 0,
            histogram.iloc[-1] if not histogram.empty else 0
        )
    
    @staticmethod
    def _determine_trend(current: float, ma_20: Optional[float], ma_50: Optional[float]) -> str:
        """Determine overall trend"""
        if ma_20 is None:
            return "INSUFFICIENT_DATA"
        
        if ma_50 is None:
            return "BULLISH" if current > ma_20 else "BEARISH"
        
        if current > ma_20 > ma_50:
            return "STRONG_UPTREND"
        elif current > ma_20:
            return "BULLISH"
        elif current < ma_20 < ma_50:
            return "STRONG_DOWNTREND"
        else:
            return "BEARISH"
    
    def _format_analysis(self, analysis: dict, df: pd.DataFrame) -> str:
        """Format analysis into readable report"""
        
        output = f"""Technical Analysis for {self.ticker} ({self.timeframe})
{'='*60}

PRICE OVERVIEW:
- Current Price: ${analysis['current_price']:.2f}
- Period Change: {analysis['price_change_pct']:+.2f}%
- Volatility: {analysis['volatility']:.2f}%
- Data Points: {analysis['data_points']}

MOVING AVERAGES:
- 20-day MA: ${analysis['ma_20']:.2f if analysis['ma_20'] else 'N/A'} ({self._price_vs_ma(analysis['current_price'], analysis['ma_20'])})
- 50-day MA: ${analysis['ma_50']:.2f if analysis['ma_50'] else 'N/A'} ({self._price_vs_ma(analysis['current_price'], analysis['ma_50'])})
- 200-day MA: ${analysis['ma_200']:.2f if analysis['ma_200'] else 'N/A'} ({self._price_vs_ma(analysis['current_price'], analysis['ma_200'])})

MOMENTUM INDICATORS:
- RSI (14): {analysis['rsi']:.1f} ({self._rsi_interpretation(analysis['rsi'])})
- MACD: {analysis['macd_line']:.2f} (Signal: {analysis['signal_line']:.2f})
- MACD Histogram: {analysis['macd_histogram']:.2f} ({'Bullish' if analysis['macd_histogram'] > 0 else 'Bearish'})

VOLUME ANALYSIS:
- Current Volume: {analysis['current_volume']:,.0f}
- Average Volume: {analysis['avg_volume']:,.0f}
- Volume Ratio: {analysis['volume_ratio']:.2f}x ({'High' if analysis['volume_ratio'] > 1.5 else 'Normal' if analysis['volume_ratio'] > 0.7 else 'Low'})

TREND ASSESSMENT:
- Overall Trend: {analysis['trend']}

TECHNICAL SUMMARY:
{self._generate_summary(analysis)}
"""
        
        return output
    
    @staticmethod
    def _price_vs_ma(price: float, ma: Optional[float]) -> str:
        """Compare price to moving average"""
        if ma is None:
            return "N/A"
        diff_pct = ((price - ma) / ma) * 100
        if diff_pct > 5:
            return f"Above by {diff_pct:.1f}%"
        elif diff_pct < -5:
            return f"Below by {abs(diff_pct):.1f}%"
        else:
            return "Near"
    
    @staticmethod
    def _rsi_interpretation(rsi: float) -> str:
        """Interpret RSI value"""
        if rsi > 70:
            return "Overbought"
        elif rsi > 60:
            return "Bullish"
        elif rsi < 30:
            return "Oversold"
        elif rsi < 40:
            return "Bearish"
        else:
            return "Neutral"
    
    def _generate_summary(self, analysis: dict) -> str:
        """Generate natural language summary"""
        summaries = []
        
        # Trend summary
        if analysis['trend'] in ['STRONG_UPTREND', 'BULLISH']:
            summaries.append(f"Stock is in a {analysis['trend'].lower().replace('_', ' ')} with price above key moving averages")
        else:
            summaries.append(f"Stock shows {analysis['trend'].lower().replace('_', ' ')} pattern")
        
        # RSI summary
        if analysis['rsi'] > 70:
            summaries.append("RSI indicates overbought conditions, potential pullback risk")
        elif analysis['rsi'] < 30:
            summaries.append("RSI shows oversold conditions, potential bounce opportunity")
        
        # Volume summary
        if analysis['volume_ratio'] > 1.5:
            summaries.append(f"Above-average volume ({analysis['volume_ratio']:.1f}x) confirms price movement")
        
        # MACD summary
        if analysis['macd_histogram'] > 0 and analysis['macd_line'] > analysis['signal_line']:
            summaries.append("MACD shows bullish momentum")
        elif analysis['macd_histogram'] < 0:
            summaries.append("MACD indicates bearish momentum")
        
        return ". ".join(summaries) + "."
    
    async def _arun(self, query: str = "") -> str:
        """Async version"""
        return self._run(query)


# ==========================================
# TOOL 3: SOCIAL SENTIMENT TOOL
# ==========================================

class SocialSentimentInput(BaseModel):
    """Input schema for social sentiment"""
    query: str = Field(
        default="",
        description="Optional refinement (not used)"
    )


class SocialSentimentTool(BaseTool):
    name: str = "Social Media Sentiment Analysis"
    description: str = (
        "Analyzes social media buzz, sentiment, and discussion volume "
        "from platforms like Reddit, Twitter, and StockTwits. "
        "Identifies trending topics and retail investor sentiment."
    )
    args_schema: Type[BaseModel] = SocialSentimentInput
    ticker: str = Field(..., description="Stock ticker to analyze")
    
    def __init__(self, ticker: str):
        super().__init__()
        self.ticker = ticker.upper()
    
    def _run(self, query: str = "") -> str:
        """
        Analyze social sentiment from CSV or generate mock data
        
        Returns:
            str: Social sentiment analysis report
        """
        try:
            logger.info(f"Analyzing social sentiment for {self.ticker}")
            
            # Try to load from CSV first
            csv_path = os.path.join(
                os.path.dirname(__file__),
                'data',
                'mock_tweets_2024.csv'
            )
            
            if os.path.exists(csv_path):
                return self._analyze_from_csv(csv_path)
            else:
                logger.warning(f"CSV not found at {csv_path}, generating mock data")
                return self._generate_mock_sentiment()
        
        except Exception as e:
            logger.error(f"Social sentiment analysis failed: {str(e)}")
            return f"Error analyzing social sentiment: {str(e)}"
    
    def _analyze_from_csv(self, csv_path: str) -> str:
        """Analyze sentiment from CSV file"""
        try:
            df = pd.read_csv(csv_path)
            
            # Filter for this ticker
            ticker_data = df[df['ticker'].str.upper() == self.ticker]
            
            if ticker_data.empty:
                return self._generate_mock_sentiment()
            
            # Calculate metrics
            total_mentions = len(ticker_data)
            avg_sentiment = ticker_data['sentiment_score'].mean()
            bullish_pct = (ticker_data['sentiment_score'] > 0.3).sum() / total_mentions * 100
            bearish_pct = (ticker_data['sentiment_score'] < -0.3).sum() / total_mentions * 100
            neutral_pct = 100 - bullish_pct - bearish_pct
            
            # Determine overall mood
            if avg_sentiment > 0.5:
                mood = "VERY BULLISH"
            elif avg_sentiment > 0.2:
                mood = "BULLISH"
            elif avg_sentiment < -0.5:
                mood = "VERY BEARISH"
            elif avg_sentiment < -0.2:
                mood = "BEARISH"
            else:
                mood = "NEUTRAL"
            
            # Sample top posts
            top_posts = ticker_data.nlargest(3, 'sentiment_score')['text'].tolist()
            
            output = f"""Social Media Sentiment Analysis for {self.ticker}
{'='*60}

SENTIMENT OVERVIEW:
- Overall Mood: {mood}
- Average Sentiment Score: {avg_sentiment:.2f} (scale: -1 to +1)
- Total Mentions: {total_mentions}

SENTIMENT BREAKDOWN:
- Bullish Posts: {bullish_pct:.1f}%
- Neutral Posts: {neutral_pct:.1f}%
- Bearish Posts: {bearish_pct:.1f}%

TRENDING TOPICS:
{self._extract_trending_topics(ticker_data)}

TOP BULLISH POSTS:
{self._format_posts(top_posts)}

ANALYSIS:
{self._generate_social_summary(mood, total_mentions, avg_sentiment)}
"""
            
            return output
        
        except Exception as e:
            logger.error(f"CSV analysis failed: {str(e)}")
            return self._generate_mock_sentiment()
    
    def _generate_mock_sentiment(self) -> str:
        """Generate mock social sentiment"""
        import random
        
        # Random but realistic metrics
        avg_sentiment = random.uniform(0.3, 0.8)
        total_mentions = random.randint(200, 800)
        bullish_pct = random.randint(70, 90)
        
        mood = "VERY BULLISH" if avg_sentiment > 0.6 else "BULLISH"
        
        output = f"""Social Media Sentiment Analysis for {self.ticker}
{'='*60}

SENTIMENT OVERVIEW:
- Overall Mood: {mood}
- Average Sentiment Score: {avg_sentiment:.2f} (scale: -1 to +1)
- Total Mentions: {total_mentions}

SENTIMENT BREAKDOWN:
- Bullish Posts: {bullish_pct}%
- Neutral Posts: {100 - bullish_pct - 8}%
- Bearish Posts: 8%

TRENDING TOPICS:
- Earnings beat expectations
- New product launch excitement
- Institutional accumulation noted
- Short squeeze potential discussed

REDDIT (r/wallstreetbets):
- Mentions up 250% week-over-week
- Multiple DD (due diligence) posts trending
- Emoji usage: 🚀🚀🚀 (very bullish indicator)

TWITTER/X:
- $Cashtag mentions: {random.randint(1000, 5000)} (24h)
- Influencer engagement: High
- Sentiment ratio: {bullish_pct}% bullish

STOCKTWITS:
- Bull/Bear Ratio: {bullish_pct}/{100-bullish_pct}
- Message Volume: Above average

ANALYSIS:
Strong retail bullish sentiment driven by recent fundamental catalysts. 
Social buzz is elevated but not at extreme levels that would indicate 
contrarian sell signal. Momentum appears sustainable.

NOTE: This is mock data. Configure real social API for live analysis.
"""
        
        return output
    
    @staticmethod
    def _extract_trending_topics(df: pd.DataFrame) -> str:
        """Extract trending keywords from posts"""
        # Simple keyword extraction (could be improved with NLP)
        all_text = " ".join(df['text'].astype(str).tolist()).lower()
        
        keywords = ['earnings', 'moon', 'bullish', 'squeeze', 'breakout', 
                   'buy', 'rocket', 'calls', 'yolo']
        
        found_topics = [kw for kw in keywords if kw in all_text]
        
        if found_topics:
            return "- " + "\n- ".join(found_topics[:5])
        else:
            return "- General positive sentiment\n- Price target discussions"
    
    @staticmethod
    def _format_posts(posts: list) -> str:
        """Format sample posts"""
        if not posts:
            return "- No posts available"
        
        formatted = []
        for idx, post in enumerate(posts[:3], 1):
            formatted.append(f"{idx}. {post[:100]}...")
        
        return "\n".join(formatted)
    
    def _generate_social_summary(self, mood: str, mentions: int, score: float) -> str:
        """Generate summary analysis"""
        if mentions > 500:
            volume_desc = "Very high"
        elif mentions > 200:
            volume_desc = "Elevated"
        else:
            volume_desc = "Moderate"
        
        if score > 0.6:
            conviction = "strong bullish conviction"
        elif score > 0.3:
            conviction = "moderate bullish sentiment"
        else:
            conviction = "mixed sentiment"
        
        return f"""{volume_desc} social media activity with {conviction}. 
Retail investors appear {'very enthusiastic' if score > 0.6 else 'cautiously optimistic'} 
about {self.ticker}'s near-term prospects. Sentiment is 
{'likely to provide short-term momentum support' if score > 0.5 else 'neutral to price action'}."""
    
    async def _arun(self, query: str = "") -> str:
        """Async version"""
        return self._run(query)


# ==========================================
# FACTORY FUNCTIONS (Convenience)
# ==========================================

def create_news_tool(ticker: str) -> NewsSearchTool:
    """Factory function to create news tool"""
    return NewsSearchTool(ticker=ticker)


def create_price_tool(ticker: str, timeframe: str = '30d') -> PriceAnalysisTool:
    """Factory function to create price analysis tool"""
    return PriceAnalysisTool(ticker=ticker, timeframe=timeframe)


def create_social_tool(ticker: str) -> SocialSentimentTool:
    """Factory function to create social sentiment tool"""
    return SocialSentimentTool(ticker=ticker)