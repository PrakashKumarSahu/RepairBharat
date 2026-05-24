"""
Django REST Framework views for Provider API endpoints.

Implements:
- GET /api/providers/:id - Provider detail
- GET /api/providers/:id/reviews - Provider reviews with pagination
- POST /api/providers/:id/reviews - Create review
- GET /api/providers/:id/stats - Provider statistics
- GET /api/providers - List providers
"""
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Count, Prefetch, Q

from .models import Provider, Review, Technician
from .serializers import (
    ProviderDetailSerializer,
    ProviderListSerializer,
    ReviewSerializer,
    ReviewListSerializer,
    ProviderStatsSerializer,
)
from .services.provider_stats import get_provider_stats, get_provider_reviews_summary


class ReviewPagination(PageNumberPagination):
    """
    Pagination for reviews - 10 reviews per page.
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class ProviderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Provider viewset with custom actions for reviews and statistics.
    
    Endpoints:
    - GET /api/providers/ - List all providers
    - GET /api/providers/:id/ - Get provider detail
    - GET /api/providers/:id/reviews/ - Get provider reviews
    - POST /api/providers/:id/reviews/ - Create review
    - GET /api/providers/:id/stats/ - Get provider statistics
    """
    queryset = Provider.objects.filter(is_active=True).select_related('owner').prefetch_related('services')
    serializer_class = ProviderDetailSerializer
    lookup_field = 'id'
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return ProviderListSerializer
        return ProviderDetailSerializer
    
    def get_queryset(self):
        """
        Optimize queryset based on action.
        """
        queryset = Provider.objects.filter(is_active=True)
        
        if self.action == 'list':
            # Light query for list
            queryset = queryset.select_related('owner').annotate(technician_count=Count('technicians'))
        elif self.action == 'retrieve':
            # Heavy query for detail with related objects
            active_technicians = Technician.objects.filter(is_active=True).select_related('user', 'user__profile')
            queryset = queryset.select_related('owner', 'owner__profile').prefetch_related(
                'services',
                Prefetch('technicians', queryset=active_technicians),
            )
        
        return queryset.order_by('-trust_score', '-avg_rating')
    
    @action(detail=True, methods=['get', 'post'], url_path='reviews')
    def reviews(self, request, id=None):
        """
        List or create reviews for a provider.
        
        GET: List reviews with pagination
        - Query params:
          - page: Page number (default: 1)
          - page_size: Results per page (default: 10, max: 100)
        
        POST: Create a new review
        - Request body:
          {
              "rating": 5,
              "comment": "Great service!",
              "customer_id": 1,
              "customer_image": "https://...",
              "is_verified_purchase": true
          }
        
        Returns:
            GET: Paginated list of reviews
            POST: Created review with 201 status
        """
        provider = self.get_object()
        
        if request.method == 'GET':
            reviews_qs = provider.reviews.select_related('customer').order_by('-created_at')
            paginator = ReviewPagination()
            paginated_reviews = paginator.paginate_queryset(reviews_qs, request)
            serializer = ReviewListSerializer(paginated_reviews, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        elif request.method == 'POST':
            serializer = ReviewSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(provider=provider)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'], url_path='stats')
    def stats(self, request, id=None):
        """
        Get provider statistics and metrics.
        
        Returns:
            {
                "jobs_completed": 150,
                "repeat_customer_percentage": 45.5,
                "average_response_time_minutes": 30,
                "trust_score": 78.5,
                "average_rating": 4.5,
                "review_count": 42,
                "verified": true,
                "years_of_experience": 5
            }
        """
        provider = self.get_object()
        stats = get_provider_stats(provider)
        serializer = ProviderStatsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], url_path='summary')
    def summary(self, request, id=None):
        """
        Get provider reviews summary with rating distribution.
        """
        provider = self.get_object()
        limit = int(request.query_params.get('limit', 50))
        summary = get_provider_reviews_summary(provider, limit)
        
        reviews_serializer = ReviewListSerializer(summary['reviews'], many=True)
        
        return Response({
            'total_reviews': summary['total_reviews'],
            'average_rating': summary['average_rating'],
            'rating_distribution': summary['rating_distribution'],
            'reviews': reviews_serializer.data,
        })


class ProviderListView(generics.ListAPIView):
    """
    List all providers with optional filtering.
    
    Query params:
    - search: Search by shop_name
    - verified: Filter by verified status (true/false)
    - min_rating: Minimum average rating
    - is_open: Filter by open status (true/false)
    """
    queryset = Provider.objects.filter(is_active=True).select_related('owner').order_by('-trust_score')
    serializer_class = ProviderListSerializer
    pagination_class = ReviewPagination
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Search by shop name or bio
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(shop_name__icontains=search) | 
                Q(bio__icontains=search)
            )
        
        # Filter by verified status
        verified = self.request.query_params.get('verified', None)
        if verified in ['true', 'True']:
            queryset = queryset.filter(verified=True)
        elif verified in ['false', 'False']:
            queryset = queryset.filter(verified=False)
        
        # Filter by minimum rating
        min_rating = self.request.query_params.get('min_rating', None)
        if min_rating:
            try:
                min_rating = float(min_rating)
                queryset = queryset.filter(avg_rating__gte=min_rating)
            except ValueError:
                pass
        
        # Filter by open status
        is_open = self.request.query_params.get('is_open', None)
        if is_open in ['true', 'True']:
            queryset = queryset.filter(is_open=True)
        elif is_open in ['false', 'False']:
            queryset = queryset.filter(is_open=False)
        
        return queryset.annotate(technician_count=Count('technicians'))


