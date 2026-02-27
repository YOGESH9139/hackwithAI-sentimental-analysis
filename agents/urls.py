# agents_api/urls.py

from django.urls import path
from . import views

app_name = 'agents_api'

urlpatterns = [
    # Core endpoints
    path('analyze', views.trigger_analysis, name='trigger_analysis'),
    path('results/<uuid:run_id>', views.get_results, name='get_results'),
    
    # Health check
    path('health', views.health_check, name='health_check'),
    
    # Optional: Management endpoints
    path('runs', views.list_recent_runs, name='list_runs'),
    path('runs/<uuid:run_id>', views.cancel_run, name='cancel_run'),
    path('stats', views.stats_dashboard, name='stats'),
]