# agents_api/models.py

from django.db import models
from django.utils import timezone
import json
import uuid


class AgentRun(models.Model):
    """
    Stores the state and results of a single agent analysis run
    """
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('RUNNING', 'Running'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]
    
    # Primary Key
    id = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False,
        help_text="Unique identifier for this analysis run"
    )
    
    # Input Parameters
    ticker = models.CharField(
        max_length=10,
        db_index=True,
        help_text="Stock ticker symbol (e.g., TSLA, AAPL)"
    )
    timeframe = models.CharField(
        max_length=10, 
        default='30d',
        help_text="Time period for technical analysis (e.g., 30d, 90d, 1y)"
    )
    include_social = models.BooleanField(
        default=True,
        help_text="Whether to include social sentiment analysis"
    )
    
    # Status Tracking
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='PENDING',
        db_index=True
    )
    
    # Results Storage (JSON strings)
    agent_outputs = models.TextField(
        null=True, 
        blank=True,
        help_text="JSON array of individual agent outputs"
    )
    consensus_data = models.TextField(
        null=True, 
        blank=True,
        help_text="JSON object containing final consensus decision"
    )
    
    # Metadata
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True
    )
    started_at = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="When the Celery task actually started processing"
    )
    completed_at = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="When the analysis finished"
    )
    execution_time = models.IntegerField(
        null=True, 
        blank=True,
        help_text="Total execution time in seconds"
    )
    
    # Error Handling
    error_message = models.TextField(
        null=True, 
        blank=True,
        help_text="Error details if status is FAILED"
    )
    retry_count = models.IntegerField(
        default=0,
        help_text="Number of times this task has been retried"
    )
    
    # Additional Metadata
    llm_model = models.CharField(
        max_length=100,
        default='llama-3.1-70b-versatile',
        help_text="LLM model used for analysis"
    )
    news_sources_count = models.IntegerField(
        null=True,
        blank=True,
        help_text="Number of news sources analyzed"
    )
    price_data_points = models.IntegerField(
        null=True,
        blank=True,
        help_text="Number of price data points analyzed"
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Agent Run'
        verbose_name_plural = 'Agent Runs'
        indexes = [
            models.Index(fields=['-created_at', 'ticker']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.ticker} - {self.status} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
    
    # JSON Helper Methods
    def get_agent_outputs(self):
        """Parse agent_outputs JSON string to Python list"""
        if not self.agent_outputs:
            return []
        try:
            return json.loads(self.agent_outputs)
        except json.JSONDecodeError:
            return []
    
    def set_agent_outputs(self, data):
        """Store Python list/dict as JSON string"""
        self.agent_outputs = json.dumps(data, indent=2)
    
    def get_consensus_data(self):
        """Parse consensus_data JSON string to Python dict"""
        if not self.consensus_data:
            return {}
        try:
            return json.loads(self.consensus_data)
        except json.JSONDecodeError:
            return {}
    
    def set_consensus_data(self, data):
        """Store Python dict as JSON string"""
        self.consensus_data = json.dumps(data, indent=2)
    
    # Status Helper Methods
    def mark_as_running(self):
        """Mark run as started"""
        self.status = 'RUNNING'
        self.started_at = timezone.now()
        self.save(update_fields=['status', 'started_at'])
    
    def mark_as_completed(self, execution_time=None):
        """Mark run as completed"""
        self.status = 'COMPLETED'
        self.completed_at = timezone.now()
        if execution_time:
            self.execution_time = execution_time
        self.save(update_fields=['status', 'completed_at', 'execution_time'])
    
    def mark_as_failed(self, error_msg):
        """Mark run as failed with error message"""
        self.status = 'FAILED'
        self.error_message = error_msg
        self.completed_at = timezone.now()
        self.save(update_fields=['status', 'error_message', 'completed_at'])
    
    # Computed Properties
    @property
    def is_complete(self):
        """Check if run has finished (success or failure)"""
        return self.status in ['COMPLETED', 'FAILED']
    
    @property
    def is_successful(self):
        """Check if run completed successfully"""
        return self.status == 'COMPLETED'
    
    @property
    def estimated_completion_time(self):
        """Estimate when run will complete (for frontend polling)"""
        if self.status == 'PENDING':
            return self.created_at + timezone.timedelta(seconds=45)
        elif self.status == 'RUNNING' and self.started_at:
            return self.started_at + timezone.timedelta(seconds=45)
        return None
    
    @property
    def consensus_action(self):
        """Quick accessor for consensus action"""
        consensus = self.get_consensus_data()
        return consensus.get('action', 'UNKNOWN')
    
    @property
    def consensus_score(self):
        """Quick accessor for consensus score"""
        consensus = self.get_consensus_data()
        return consensus.get('score', 0.0)


class AnalysisArchive(models.Model):
    """
    Optional: Archive old runs for historical comparison
    Could be used for showing past predictions vs actual outcomes
    """
    
    original_run = models.ForeignKey(
        AgentRun,
        on_delete=models.CASCADE,
        related_name='archives'
    )
    archived_at = models.DateTimeField(auto_now_add=True)
    actual_outcome = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text="What actually happened (for backtesting accuracy)"
    )
    actual_price_change = models.FloatField(
        null=True,
        blank=True,
        help_text="Actual price change % after 7/30 days"
    )
    
    class Meta:
        ordering = ['-archived_at']
        verbose_name = 'Analysis Archive'
        verbose_name_plural = 'Analysis Archives'
    
    def __str__(self):
        return f"Archive of {self.original_run.ticker} run"
