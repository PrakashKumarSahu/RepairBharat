"""
Provider statistics and metrics service.

Handles calculations for:
- Average rating from reviews
- Jobs completed statistics
- Repeat customer percentage
- Review aggregations
"""
from decimal import Decimal
from django.db.models import Avg, Count, Q
from datetime import timedelta
from django.utils import timezone


def update_provider_stats(provider):
    """
    Recalculate and update provider statistics from reviews and order data.
    
    Args:
        provider: Provider instance to update
    """
    # Calculate average rating
    avg_rating = provider.reviews.aggregate(Avg('rating'))['rating__avg']
    provider.avg_rating = Decimal(str(avg_rating)) if avg_rating else Decimal('0.0')
    
    # Update review count
    provider.review_count = provider.reviews.count()
    
    # Calculate repeat customer rate if we have job data
    # This would typically come from a separate JobsCompleted or Order model
    # For now, we estimate from reviews
    unique_reviewers = provider.reviews.values('customer').distinct().count()
    if provider.jobs_completed > 0:
        # Cap repeat rate at 100% (can't have more unique reviewers than jobs)
        repeat_rate = min(
            Decimal(str((unique_reviewers / provider.jobs_completed) * 100)),
            Decimal('100')
        )
        provider.repeat_customer_rate = repeat_rate.quantize(Decimal('0.01'))
    else:
        # No jobs completed yet
        provider.repeat_customer_rate = Decimal('0.0')
    
    # Save updated stats
    provider.save()
    
    # Recalculate trust score
    provider.trust_score = provider.calculate_trust_score()
    provider.save()


def get_provider_reviews_summary(provider, limit: int = 100):
    """
    Get summary of provider reviews with pagination support.
    
    Args:
        provider: Provider instance
        limit: Number of reviews to return
    
    Returns:
        dict: Review summary with ratings breakdown
    """
    # Get rating distribution using aggregation
    rating_distribution = provider.reviews.values('rating').annotate(
        count=Count('id')
    ).order_by('rating')
    
    rating_dict = {i: 0 for i in range(1, 6)}
    for item in rating_distribution:
        rating_dict[item['rating']] = item['count']
    
        # Get specific reviews for list
        reviews = provider.reviews.select_related('customer').order_by('-created_at')[:limit]
    
    return {
        'reviews': reviews,
        'total_reviews': provider.review_count,
        'average_rating': float(provider.avg_rating),
        'rating_distribution': rating_dict,
    }


def get_provider_stats(provider):
    """
    Get comprehensive provider statistics.
    
    Args:
        provider: Provider instance
    
    Returns:
        dict: Comprehensive provider statistics
    """
    return {
        'jobs_completed': provider.jobs_completed,
        'repeat_customer_percentage': float(provider.repeat_customer_rate),
        'average_response_time_minutes': provider.average_response_time_minutes,
        'trust_score': float(provider.trust_score),
        'average_rating': float(provider.avg_rating),
        'review_count': provider.review_count,
        'verified': provider.verified,
        'years_of_experience': provider.years_of_experience,
    }


def update_technician_stats(technician):
    """
    Recalculate and update technician statistics from reviews and order data.
    
    Args:
        technician: Technician instance to update
    """
    # Calculate average rating
    avg_rating = technician.reviews.aggregate(Avg('rating'))['rating__avg']
    technician.avg_rating = Decimal(str(avg_rating)) if avg_rating else Decimal('0.0')
    
    # Update review count
    technician.review_count = technician.reviews.count()
    
    # Calculate repeat customer rate if we have job data
    unique_reviewers = technician.reviews.values('customer').distinct().count()
    if technician.jobs_completed > 0:
        # Cap repeat rate at 100% (can't have more unique reviewers than jobs)
        repeat_rate = min(
            Decimal(str((unique_reviewers / technician.jobs_completed) * 100)),
            Decimal('100')
        )
        technician.repeat_customer_rate = repeat_rate.quantize(Decimal('0.01'))
    else:
        # No jobs completed yet
        technician.repeat_customer_rate = Decimal('0.0')
    
    # Save updated stats
    technician.save()
    
    # Recalculate trust score
    technician.trust_score = technician.calculate_trust_score()
    technician.save()


def get_technician_reviews_summary(technician, limit: int = 100):
    """
    Get summary of technician reviews with pagination support.
    
    Args:
        technician: Technician instance
        limit: Number of reviews to return
    
    Returns:
        dict: Review summary with ratings breakdown
    """
    # Get rating distribution using aggregation
    rating_distribution = technician.reviews.values('rating').annotate(
        count=Count('id')
    ).order_by('rating')
    
    rating_dict = {i: 0 for i in range(1, 6)}
    for item in rating_distribution:
        rating_dict[item['rating']] = item['count']
    
    # Get specific reviews for list
    reviews = technician.reviews.select_related('customer').order_by('-created_at')[:limit]
    
    return {
        'reviews': reviews,
        'total_reviews': technician.review_count,
        'average_rating': float(technician.avg_rating),
        'rating_distribution': rating_dict,
    }


def get_technician_stats(technician):
    """
    Get comprehensive technician statistics.
    
    Args:
        technician: Technician instance
    
    Returns:
        dict: Comprehensive technician statistics
    """
    return {
        'jobs_completed': technician.jobs_completed,
        'repeat_customer_percentage': float(technician.repeat_customer_rate),
        'average_response_time_minutes': technician.average_response_time_minutes,
        'trust_score': float(technician.trust_score),
        'average_rating': float(technician.avg_rating),
        'review_count': technician.review_count,
        'years_of_experience': technician.years_of_experience,
    }
