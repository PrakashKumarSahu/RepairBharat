from django.urls import path
from . import views

urlpatterns = [
    path('revenue/', views.revenue_over_time, name='analytics-revenue'),
    path('tickets/status-summary/', views.ticket_status_summary, name='analytics-ticket-status'),
    path('technicians/performance/', views.technician_performance, name='analytics-tech-performance'),
    path('inventory/low-stock/', views.low_stock_summary, name='analytics-low-stock'),
    path('kpis/', views.dashboard_kpis, name='analytics-kpis'),
]
