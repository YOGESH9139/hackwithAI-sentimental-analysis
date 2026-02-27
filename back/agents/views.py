# agents_api/views.py

from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Count, Q
from datetime import timedelta

from .models import AgentRun
from .serializers import (
    AnalyzeRequestSerializer,
    AgentRunDetailSerializer,
    AgentRunListSerializer,
    TriggerAnalysisResponseSerializer,
    PendingRunSerializer,
    FailedRunSerializer
)
from .tasks import run_agent_analysis

import logging

logger = logging.getLogger(__name__)


class AnalysisRateThrottle(AnonRateThrottle):
    """
    Custom throttle: 10 analysis requests per minute per IP
    """
    rate = '10/min'


@api_view(['POST'])
@throttle_classes([AnalysisRateThrottle])
def trigger_analysis(request):
    """
    POST /api/analyze
    
    Triggers async agent analysis via Celery
    
    Request Body:
    {
        "ticker": "TSLA",
        "timeframe": "30d",
        "include_social": true
    }
    
    Response 202 Accepted:
    {
        "run_id": "abc-123-def-456",
        "status": "RUNNING",
        "estimated_time": 45,
        "poll_url": "/api/results/abc-123-def-456"
    }
    
    Response 400 Bad Request:
    {
        "ticker": ["This field is required."]
    }
    """
    
    # Validate request data
    serializer = AnalyzeRequestSerializer(data=request.data)
    
    if not serializer.is_valid():
        logger.warning(f"Invalid analysis request: {serializer.errors}")
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
    data = serializer.validated_data
    ticker = data['ticker']
    timeframe = data['timeframe']
    include_social = data['include_social']
    
    # Check for recent duplicate run (optional anti-spam)
    recent_cutoff = timezone.now() - timedelta(minutes=2)
    recent_run = AgentRun.objects.filter(
        ticker=ticker,
        status__in=['PENDING', 'RUNNING'],
        created_at__gte=recent_cutoff
    ).first()
    
    if recent_run:
        logger.info(f"Found recent pending run for {ticker}: {recent_run.id}")
        return Response({
            'run_id': str(recent_run.id),
            'status': recent_run.status,
            'estimated_time': 45,
            'poll_url': f'/api/results/{recent_run.id}',
            'message': 'Using existing pending analysis'
        }, status=status.HTTP_202_ACCEPTED)
    
    # Create new AgentRun record
    agent_run = AgentRun.objects.create(
        ticker=ticker,
        timeframe=timeframe,
        include_social=include_social,
        status='PENDING'
    )
    
    logger.info(f"Created new AgentRun: {agent_run.id} for {ticker}")
    
    # Kick off Celery task asynchronously
    try:
        task = run_agent_analysis.delay(str(agent_run.id))
        logger.info(f"Dispatched Celery task {task.id} for run {agent_run.id}")
    except Exception as e:
        logger.error(f"Failed to dispatch Celery task: {str(e)}")
        agent_run.mark_as_failed(f"Failed to start task: {str(e)}")
        return Response({
            'error': 'Failed to start analysis task',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Return 202 Accepted with run_id for polling
    response_data = {
        'run_id': str(agent_run.id),
        'status': 'RUNNING',
        'estimated_time': 45,  # seconds
        'poll_url': f'/api/results/{agent_run.id}'
    }
    
    return Response(
        response_data,
        status=status.HTTP_202_ACCEPTED
    )


@api_view(['GET'])
def get_results(request, run_id):
    """
    GET /api/results/{run_id}
    
    Returns agent analysis results (polls until complete)
    
    Response 200 (PENDING/RUNNING):
    {
        "run_id": "abc-123",
        "status": "RUNNING",
        "message": "Analysis in progress...",
        "elapsed_time": 12
    }
    
    Response 200 (COMPLETED):
    {
        "run_id": "abc-123",
        "ticker": "TSLA",
        "status": "COMPLETED",
        "agents": [...],
        "consensus": {...},
        "metadata": {...}
    }
    
    Response 500 (FAILED):
    {
        "run_id": "abc-123",
        "status": "FAILED",
        "error": "Error message here"
    }
    
    Response 404:
    {
        "detail": "Not found."
    }
    """
    
    # Fetch AgentRun or 404
    agent_run = get_object_or_404(AgentRun, id=run_id)
    
    # CASE 1: Run failed
    if agent_run.status == 'FAILED':
        logger.warning(f"AgentRun {run_id} failed: {agent_run.error_message}")
        
        serializer = FailedRunSerializer({
            'run_id': agent_run.id,
            'status': 'FAILED',
            'error': agent_run.error_message or 'Unknown error occurred',
            'retry_count': agent_run.retry_count,
            'created_at': agent_run.created_at
        })
        
        return Response(
            serializer.data,
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # CASE 2: Run still pending or running
    if agent_run.status in ['PENDING', 'RUNNING']:
        elapsed_time = None
        if agent_run.started_at:
            elapsed_time = int((timezone.now() - agent_run.started_at).total_seconds())
        elif agent_run.status == 'PENDING':
            elapsed_time = int((timezone.now() - agent_run.created_at).total_seconds())
        
        serializer = PendingRunSerializer({
            'run_id': agent_run.id,
            'status': agent_run.status,
            'message': 'Analysis in progress... Agents are debating.',
            'estimated_completion': agent_run.estimated_completion_time,
            'elapsed_time': elapsed_time
        })
        
        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )
    
    # CASE 3: Run completed successfully
    if agent_run.status == 'COMPLETED':
        logger.info(f"Returning completed results for run {run_id}")
        
        serializer = AgentRunDetailSerializer(agent_run)
        response_data = serializer.data
        
        # Add summary stats for frontend
        agents = agent_run.get_agent_outputs()
        if agents:
            response_data['summary'] = {
                'total_agents': len(agents),
                'avg_score': sum(a.get('score', 0) for a in agents) / len(agents),
                'max_confidence': max((a.get('confidence', 0) for a in agents), default=0),
                'min_confidence': min((a.get('confidence', 0) for a in agents), default=0)
            }
        
        return Response(
            response_data,
            status=status.HTTP_200_OK
        )
    
    # Fallback (should never reach here)
    return Response({
        'error': 'Unknown status',
        'status': agent_run.status
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def health_check(request):
    """
    GET /api/health
    
    Simple health check endpoint
    
    Response 200:
    {
        "status": "ok",
        "service": "sentiment-agents-api",
        "version": "1.0.0",
        "timestamp": "2026-02-27T14:30:00Z"
    }
    """
    return Response({
        'status': 'ok',
        'service': 'sentiment-agents-api',
        'version': '1.0.0',
        'timestamp': timezone.now().isoformat(),
        'django_version': '5.0.2'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def list_recent_runs(request):
    """
    GET /api/runs?ticker=TSLA&limit=10
    
    Optional endpoint to list recent runs (for debugging or history view)
    
    Query params:
    - ticker: Filter by ticker (optional)
    - limit: Max results (default 20, max 100)
    - status: Filter by status (optional)
    
    Response 200:
    {
        "count": 5,
        "results": [...]
    }
    """
    
    # Get query params
    ticker = request.query_params.get('ticker', None)
    limit = int(request.query_params.get('limit', 20))
    limit = min(limit, 100)  # Cap at 100
    status_filter = request.query_params.get('status', None)
    
    # Build queryset
    queryset = AgentRun.objects.all()
    
    if ticker:
        queryset = queryset.filter(ticker__iexact=ticker.upper())
    
    if status_filter:
        queryset = queryset.filter(status=status_filter.upper())
    
    queryset = queryset[:limit]
    
    serializer = AgentRunListSerializer(queryset, many=True)
    
    return Response({
        'count': queryset.count(),
        'results': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['DELETE'])
def cancel_run(request, run_id):
    """
    DELETE /api/runs/{run_id}
    
    Cancel a pending/running analysis (optional feature)
    
    Response 200:
    {
        "message": "Analysis cancelled",
        "run_id": "abc-123"
    }
    
    Response 400:
    {
        "error": "Cannot cancel completed run"
    }
    """
    
    agent_run = get_object_or_404(AgentRun, id=run_id)
    
    if agent_run.status in ['COMPLETED', 'FAILED']:
        return Response({
            'error': f'Cannot cancel {agent_run.status.lower()} run'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Mark as failed with cancellation message
    agent_run.mark_as_failed('Cancelled by user')
    
    logger.info(f"User cancelled run {run_id}")
    
    return Response({
        'message': 'Analysis cancelled',
        'run_id': str(run_id)
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def stats_dashboard(request):
    """
    GET /api/stats
    
    Optional: System-wide statistics for admin dashboard
    
    Response 200:
    {
        "total_runs": 1543,
        "completed_runs": 1401,
        "failed_runs": 28,
        "avg_execution_time": 38.5,
        "most_analyzed_tickers": [
            {"ticker": "TSLA", "count": 89},
            {"ticker": "AAPL", "count": 67}
        ]
    }
    """
    
    # Basic stats
    total_runs = AgentRun.objects.count()
    completed_runs = AgentRun.objects.filter(status='COMPLETED').count()
    failed_runs = AgentRun.objects.filter(status='FAILED').count()
    
    # Avg execution time
    completed_with_time = AgentRun.objects.filter(
        status='COMPLETED',
        execution_time__isnull=False
    )
    avg_time = completed_with_time.aggregate(
        avg=models.Avg('execution_time')
    )['avg']
    
    # Most analyzed tickers (top 10)
    top_tickers = AgentRun.objects.values('ticker').annotate(
        count=Count('id')
    ).order_by('-count')[:10]
    
    # Recent 24h activity
    last_24h = timezone.now() - timedelta(days=1)
    recent_count = AgentRun.objects.filter(
        created_at__gte=last_24h
    ).count()
    
    return Response({
        'total_runs': total_runs,
        'completed_runs': completed_runs,
        'failed_runs': failed_runs,
        'pending_runs': AgentRun.objects.filter(status__in=['PENDING', 'RUNNING']).count(),
        'avg_execution_time': round(avg_time, 2) if avg_time else None,
        'most_analyzed_tickers': list(top_tickers),
        'runs_last_24h': recent_count
    }, status=status.HTTP_200_OK)
