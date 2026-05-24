"""
URL configuration for providers app.

Routes:
- GET /api/providers/ - List providers
- GET /api/providers/<id>/ - Get provider detail
- GET /api/providers/<id>/reviews/ - Get provider reviews
- POST /api/providers/<id>/reviews/ - Create review
- GET /api/providers/<id>/stats/ - Get provider statistics
- GET /api/providers/<id>/summary/ - Get reviews summary
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter(trailing_slash=False)
router.register(r'providers', views.ProviderViewSet, basename='provider')

urlpatterns = [
    path('', include(router.urls)),
]
