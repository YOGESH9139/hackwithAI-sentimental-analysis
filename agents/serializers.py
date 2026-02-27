# agents_api/serializers.py

from rest_framework import serializers
from .models import AgentRun
from django.utils import timezone


class AnalyzeRequestSerializer(serializers.Serializer):
    """
    Validates incoming analysis requests from Next.js frontend
    """
    ticker = serializers.CharField(
        max_length=10,
        required=True,
        help_text="Stock ticker symbol (e.g., TSLA, AAPL, NVDA)"
    )
    timeframe = serializers.CharField(
        max_length=10,
        default='30d',
        required=False,
        help_text="Time period for analysis: 7d, 30d, 90d, 1y"
    )
    include_social = serializers.BooleanField(
        default=True,
        required=False,
        help_text="Include social media sentiment analysis"
    )
    
    def validate_ticker(self, value):
        """Ensure ticker is uppercase and alphanumeric"""
        ticker = value.strip().upper()
        if not ticker.isalnum():
            raise serializers.ValidationError(
                "Ticker must contain only letters and numbers"
            )
        if len(ticker) < 1 or len(ticker) > 10:
            raise serializers.ValidationError(
                "Ticker must be between 1 and 10 characters"
            )
        return ticker
    
    def validate_timeframe(self, value):
        """Validate timeframe format"""
        valid_timeframes = ['1d', '5d', '7d', '30d', '90d', '1y', '2y', '5y']
        if value not in valid_timeframes:
            raise serializers.ValidationError(
                f"Timeframe must be one of: {', '.join(valid_timeframes)}"
            )
        return value


class AgentOutputSerializer(serializers.Serializer):
    """
    Represents a single agent's output
    """
    name = serializers.CharField(
        help_text="Agent display name (e.g., 'Fundamental News Analyst')"
    )
    role = serializers.CharField(
        help_text="Agent role identifier (e.g., 'news', 'technical', 'social')"
    )
    score = serializers.FloatField(
        min_value=-1.0,
        max_value=1.0,
        help_text="Sentiment score from -1 (very bearish) to +1 (very bullish)"
    )
    reasoning = serializers.CharField(
        help_text="Detailed explanation of the agent's analysis"
    )
    confidence = serializers.IntegerField(
        min_value=0,
        max_value=100,
        help_text="Confidence level as percentage"
    )
    key_data = serializers.CharField(
        help_text="Most important data point or finding"
    )


class ConsensusSerializer(serializers.Serializer):
    """
    Represents the final consensus decision from Chief Risk Manager
    """
    score = serializers.FloatField(
        min_value=-1.0,
        max_value=1.0,
        help_text="Consensus sentiment score"
    )
    action = serializers.ChoiceField(
        choices=['BUY', 'SELL', 'HOLD'],
        help_text="Recommended trading action"
    )
    confidence = serializers.IntegerField(
        min_value=0,
        max_value=100,
        help_text="Overall confidence in recommendation"
    )
    allocation = serializers.IntegerField(
        min_value=0,
        max_value=100,
        help_text="Recommended portfolio allocation percentage"
    )
    stop_loss = serializers.FloatField(
        allow_null=True,
        required=False,
        help_text="Suggested stop loss price level"
    )
    take_profit = serializers.FloatField(
        allow_null=True,
        required=False,
        help_text="Suggested take profit price level"
    )
    risk_level = serializers.ChoiceField(
        choices=['LOW', 'MODERATE', 'HIGH'],
        default='MODERATE',
        help_text="Overall risk assessment"
    )


class MetadataSerializer(serializers.Serializer):
    """
    Analysis execution metadata
    """
    execution_time = serializers.IntegerField(
        allow_null=True,
        help_text="Total execution time in seconds"
    )
    llm_model = serializers.CharField(
        help_text="LLM model used (e.g., 'llama-3.1-70b-versatile')"
    )
    timestamp = serializers.DateTimeField(
        allow_null=True,
        help_text="When analysis completed (ISO 8601 format)"
    )
    news_sources = serializers.IntegerField(
        allow_null=True,
        required=False,
        help_text="Number of news sources analyzed"
    )
    price_data_points = serializers.IntegerField(
        allow_null=True,
        required=False,
        help_text="Number of historical price points analyzed"
    )


class AgentRunListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for list views
    """
    consensus_action = serializers.CharField(source='consensus_action', read_only=True)
    consensus_score = serializers.FloatField(source='consensus_score', read_only=True)
    
    class Meta:
        model = AgentRun
        fields = [
            'id',
            'ticker',
            'status',
            'consensus_action',
            'consensus_score',
            'created_at',
            'execution_time'
        ]


class AgentRunDetailSerializer(serializers.ModelSerializer):
    """
    Full serializer for detailed run results
    Used in GET /api/results/{run_id}
    """
    agents = serializers.SerializerMethodField()
    consensus = serializers.SerializerMethodField()
    metadata = serializers.SerializerMethodField()
    
    class Meta:
        model = AgentRun
        fields = [
            'id',
            'ticker',
            'timeframe',
            'include_social',
            'status',
            'agents',
            'consensus',
            'metadata',
            'created_at',
            'completed_at',
            'error_message'
        ]
    
    def get_agents(self, obj):
        """Return parsed agent outputs only if completed"""
        if obj.status == 'COMPLETED':
            return obj.get_agent_outputs()
        return []
    
    def get_consensus(self, obj):
        """Return parsed consensus data only if completed"""
        if obj.status == 'COMPLETED':
            return obj.get_consensus_data()
        return {}
    
    def get_metadata(self, obj):
        """Build metadata object"""
        return {
            'execution_time': obj.execution_time,
            'llm_model': obj.llm_model,
            'timestamp': obj.completed_at.isoformat() if obj.completed_at else None,
            'news_sources': obj.news_sources_count,
            'price_data_points': obj.price_data_points,
            'retry_count': obj.retry_count
        }


class TriggerAnalysisResponseSerializer(serializers.Serializer):
    """
    Response format for POST /api/analyze
    """
    run_id = serializers.UUIDField(
        help_text="Unique identifier to poll for results"
    )
    status = serializers.CharField(
        help_text="Current status (usually 'RUNNING')"
    )
    estimated_time = serializers.IntegerField(
        help_text="Estimated completion time in seconds"
    )
    poll_url = serializers.CharField(
        help_text="URL to poll for results",
        required=False
    )


class PendingRunSerializer(serializers.Serializer):
    """
    Response when run is still pending/running
    """
    run_id = serializers.UUIDField()
    status = serializers.CharField()
    message = serializers.CharField()
    estimated_completion = serializers.DateTimeField(
        allow_null=True,
        required=False
    )
    elapsed_time = serializers.IntegerField(
        help_text="Seconds since run started",
        required=False
    )


class FailedRunSerializer(serializers.Serializer):
    """
    Response when run failed
    """
    run_id = serializers.UUIDField()
    status = serializers.CharField()
    error = serializers.CharField()
    retry_count = serializers.IntegerField()
    created_at = serializers.DateTimeField()