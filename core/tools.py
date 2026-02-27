# agents/tools.py

"""
Tools for Multi-Agent Debate Architecture - MVP version

1. WebSurferTool - Fetches all data once
2. DatasetReaderTool - Reads from cached dataset
"""

from typing import Type
from pydantic import BaseModel, Field
import yfinance as yf
import pandas as pd
import os
import logging
import json
from datetime import datetime

logger = logging.getLogger(__name__)

# Global dataset cache
_DATASET_CACHE = {}


class WebSurferInput(BaseModel):
    query: str = Field(default="", description="Optional query refinement")


class WebSurferTool:
    name: str = "Web Surfer Data Collector"
    description: str = (
        "Fetches ALL data in one pass: news, price data with technicals, social sentiment. "
        "Returns structured JSON dataset."
    )
    args_schema: Type[BaseModel] = WebSurferInput

    def __init__(self, ticker: str, timeframe: str = '30d', include_social: bool = True):
        self.ticker = ticker.upper()
        self.timeframe = timeframe
        self.include_social = include_social

    def _run(self, query: str = "") -> str:
        logger.info(f"[WEB SURFER] Fetching all data for {self.ticker}...")

        dataset = {
            "ticker": self.ticker,
            "timestamp": datetime.now().isoformat(),
            "news_data": self._fetch_news(),
            "price_data": self._fetch_price_data(),
        }

        if self.include_social:
            dataset["social_data"] = self._fetch_social_data()

        _DATASET_CACHE[self.ticker] = dataset

        logger.info(
            f"[WEB SURFER] Dataset cached: {dataset['news_data'].get('count')} news, "
            f"{dataset['price_data'].get('data_points')} price points"
        )

        return json.dumps(dataset, indent=2)

    def _fetch_news(self) -> dict:
        try:
            if os.getenv("TAVILY_API_KEY"):
                from tavily import TavilyClient
                client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
                results = client.search(
                    query=f"{self.ticker} stock news earnings financial",
                    max_results=5,
                    search_depth="advanced"
                )

                headlines = [r['title'] for r in results.get('results', [])]
                sources = [r['url'] for r in results.get('results', [])]
                summaries = [r.get('content', '')[:200] for r in results.get('results', [])]

                return {
                    "headlines": headlines,
                    "summaries": summaries,
                    "summary": " | ".join(headlines[:3]),
                    "sources": sources,
                    "count": len(headlines)
                }
            else:
                return self._mock_news()
        except Exception as e:
            logger.error(f"[NEWS] Error: {e}")
            return self._mock_news()

    def _mock_news(self) -> dict:
        return {
            "headlines": [
                f"{self.ticker} Q4 Earnings Beat Expectations",
                f"Analysts Upgrade {self.ticker} Price Target",
                f"{self.ticker} Announces Strategic Initiative"
            ],
            "summaries": [
                "Strong quarterly results with revenue growth",
                "Multiple analysts raised targets on positive outlook",
                "New strategic direction expected to drive growth"
            ],
            "summary": f"Positive news flow for {self.ticker}",
            "sources": ["mock1", "mock2", "mock3"],
            "count": 3
        }

    def _fetch_price_data(self) -> dict:
        try:
            stock = yf.Ticker(self.ticker)
            df = stock.history(period=self.timeframe)

            if df.empty:
                return {"error": "No price data"}

            current = df['Close'].iloc[-1]
            ma_20 = df['Close'].rolling(20).mean().iloc[-1] if len(df) >= 20 else None
            ma_50 = df['Close'].rolling(50).mean().iloc[-1] if len(df) >= 50 else None
            ma_200 = df['Close'].rolling(200).mean().iloc[-1] if len(df) >= 200 else None

            rsi = self._calc_rsi(df['Close'])
            macd_signal = self._calc_macd(df['Close'])

            avg_vol = df['Volume'].mean()
            cur_vol = df['Volume'].iloc[-1]
            vol_ratio = cur_vol / avg_vol if avg_vol > 0 else 1

            change_pct = ((current - df['Close'].iloc[0]) / df['Close'].iloc[0]) * 100

            return {
                "current_price": round(float(current), 2),
                "change_pct": round(float(change_pct), 2),
                "ma_20": round(float(ma_20), 2) if ma_20 else None,
                "ma_50": round(float(ma_50), 2) if ma_50 else None,
                "ma_200": round(float(ma_200), 2) if ma_200 else None,
                "rsi": round(float(rsi), 1),
                "macd_signal": macd_signal,
                "volume_ratio": round(float(vol_ratio), 2),
                "trend": self._determine_trend(current, ma_20, ma_50),
                "data_points": len(df)
            }
        except Exception as e:
            logger.error(f"[PRICE] Error: {e}")
            return {"error": str(e)}

    def _fetch_social_data(self) -> dict:
        try:
            csv_path = os.path.join(os.path.dirname(__file__), 'data', 'mock_tweets_2024.csv')

            if os.path.exists(csv_path):
                df = pd.read_csv(csv_path)
                ticker_data = df[df['ticker'].str.upper() == self.ticker]

                if not ticker_data.empty:
                    avg_sent = ticker_data['sentiment_score'].mean()
                    mentions = len(ticker_data)
                    bullish_pct = (ticker_data['sentiment_score'] > 0.3).sum() / mentions * 100

                    return {
                        "sentiment_score": round(float(avg_sent), 2),
                        "mention_volume": int(mentions),
                        "bullish_pct": round(float(bullish_pct), 1),
                        "data_source": "csv"
                    }

            return self._mock_social()
        except Exception as e:
            logger.error(f"[SOCIAL] Error: {e}")
            return self._mock_social()

    def _mock_social(self) -> dict:
        import random
        return {
            "sentiment_score": round(random.uniform(0.4, 0.8), 2),
            "mention_volume": random.randint(200, 600),
            "bullish_pct": random.randint(70, 88),
            "data_source": "mock"
        }

    @staticmethod
    def _calc_rsi(series, period=14):
        delta = series.diff()
        gain = (delta.where(delta > 0, 0)).rolling(period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi.iloc[-1] if not rsi.empty else 50.0

    @staticmethod
    def _calc_macd(series):
        ema12 = series.ewm(span=12, adjust=False).mean()
        ema26 = series.ewm(span=26, adjust=False).mean()
        macd = ema12 - ema26
        signal = macd.ewm(span=9, adjust=False).mean()
        return "BULLISH" if macd.iloc[-1] > signal.iloc[-1] else "BEARISH"

    @staticmethod
    def _determine_trend(price, ma_20, ma_50):
        if ma_20 is None:
            return "INSUFFICIENT_DATA"
        if ma_50 is None:
            return "BULLISH" if price > ma_20 else "BEARISH"
        if price > ma_20 > ma_50:
            return "STRONG_UPTREND"
        elif price > ma_20:
            return "UPTREND"
        elif price < ma_20 < ma_50:
            return "STRONG_DOWNTREND"
        else:
            return "DOWNTREND"

    async def _arun(self, query: str = "") -> str:
        return self._run(query)


class DatasetReaderInput(BaseModel):
    query: str = Field(default="", description="Optional filter")


class DatasetReaderTool:
    name: str = "Dataset Reader"
    description: str = (
        "Reads from cached dataset. No new API calls. "
        "Query with 'news_data', 'price_data', or 'social_data'."
    )
    args_schema: Type[BaseModel] = DatasetReaderInput

    def _run(self, query: str = "") -> str:
        if not _DATASET_CACHE:
            return json.dumps({"error": "No dataset. Web Surfer must run first."})

        ticker = list(_DATASET_CACHE.keys())[0]
        dataset = _DATASET_CACHE[ticker]

        if "news" in query.lower():
            return json.dumps({"news_data": dataset.get("news_data", {})}, indent=2)
        elif "price" in query.lower():
            return json.dumps({"price_data": dataset.get("price_data", {})}, indent=2)
        elif "social" in query.lower():
            return json.dumps({"social_data": dataset.get("social_data", {})}, indent=2)
        else:
            return json.dumps(dataset, indent=2)

    async def _arun(self, query: str = "") -> str:
        return self._run(query)