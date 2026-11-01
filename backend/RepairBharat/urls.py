"""
URL configuration for RepairBharat project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.urls import include
from rest_framework_simplejwt import views as jwt_views
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """GET /api/health/ — liveness probe for Docker and uptime monitors."""
    from django.db import connection
    try:
        connection.ensure_connection()
        db_status = 'ok'
    except Exception:
        db_status = 'error'
    return Response({
        'status': 'ok',
        'db': db_status,
        'timestamp': timezone.now().isoformat(),
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    # JWT Token Refresh — login is handled by accounts/login/ (SimpleJWT TokenObtainPairView)
    path('api/token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('api/inventory/', include('inventory.urls')),
    path('api/billing/', include('billing.urls')),

    # Decoupled Enterprise Endpoints
    path('api/orgs/', include('organizations.urls')),
    path('api/providers/', include('providers.urls')),
    path('api/devices/', include('devices.urls')),
    path('api/workflow/', include('workflow.urls')),
    path('api/repairs/', include('repairs.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/audit-log/', include('core.urls')),

    # Health check + OpenAPI / Swagger docs
    path('api/health/', health_check, name='health-check'),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
