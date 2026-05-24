"""
Trust score calculation service.

Implements the formula:
trust_score = (avg_rating * 0.5) + (repeat_customer_rate * 0.3) + (response_speed_score * 0.2)
"""
from decimal import Decimal
from typing import Union


def calculate_response_speed_score(response_time_minutes: int) -> Decimal:
    """
    Convert response time in minutes to a score (0-100).
    Faster response = higher score.
    
    Formula: max(0, 100 - (response_time / 60) * 100)
    - 0 minutes = 100 score
    - 60 minutes = 0 score
    - >60 minutes = 0 score
    """
    if response_time_minutes <= 0:
        return Decimal('100')
    
    score = Decimal('100') - (Decimal(response_time_minutes) / Decimal('60')) * Decimal('100')
    return max(Decimal('0'), min(score, Decimal('100')))


def calculate_provider_trust_score(provider) -> Decimal:
    """
    Calculate overall trust score for a provider.
    
    Args:
        provider: Provider instance with avg_rating, repeat_customer_rate, average_response_time_minutes
    
    Returns:
        Decimal: Trust score between 0 and 100
    """
    # Normalize average rating to 0-100 scale
    rating_score = provider.avg_rating * Decimal('20')  # Convert 0-5 to 0-100
    
    # Repeat customer rate is already in 0-100 range
    repeat_rate_score = provider.repeat_customer_rate
    
    # Response time score
    response_speed_score = calculate_response_speed_score(provider.average_response_time_minutes)
    
    # Calculate weighted score
    trust_score = (
        (rating_score * Decimal('0.5')) +
        (repeat_rate_score * Decimal('0.3')) +
        (response_speed_score * Decimal('0.2'))
    )
    
    # Round to 2 decimal places
    return trust_score.quantize(Decimal('0.01'))


def calculate_technician_trust_score(technician) -> Decimal:
    """
    Calculate overall trust score for a technician.
    
    Args:
        technician: Technician instance with avg_rating, repeat_customer_rate, average_response_time_minutes
    
    Returns:
        Decimal: Trust score between 0 and 100
    """
    # Normalize average rating to 0-100 scale
    rating_score = technician.avg_rating * Decimal('20')  # Convert 0-5 to 0-100
    
    # Repeat customer rate is already in 0-100 range
    repeat_rate_score = technician.repeat_customer_rate
    
    # Response time score
    response_speed_score = calculate_response_speed_score(technician.average_response_time_minutes)
    
    # Calculate weighted score
    trust_score = (
        (rating_score * Decimal('0.5')) +
        (repeat_rate_score * Decimal('0.3')) +
        (response_speed_score * Decimal('0.2'))
    )
    
    # Round to 2 decimal places
    return trust_score.quantize(Decimal('0.01'))
