# agents/__init__.py

"""
Agents package for multi-agent stock sentiment analysis

This package contains:
- crew_factory: Creates CrewAI multi-agent crews
- tools: Custom tools for news, price, and social sentiment analysis
- data: Mock data for testing
"""

from .crew_factory import create_sentiment_crew, test_crew
from .tools import (
    NewsSearchTool,
    PriceAnalysisTool,
    SocialSentimentTool,
    create_news_tool,
    create_price_tool,
    create_social_tool
)

__all__ = [
    'create_sentiment_crew',
    'test_crew',
    'NewsSearchTool',
    'PriceAnalysisTool',
    'SocialSentimentTool',
    'create_news_tool',
    'create_price_tool',
    'create_social_tool',
]

__version__ = '1.0.0'