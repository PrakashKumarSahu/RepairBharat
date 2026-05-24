"""
Django signals for Provider app.
Handles automatic updates when reviews are created/deleted.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Review, TechnicianReview
from .services.provider_stats import update_provider_stats, update_technician_stats


@receiver(post_save, sender=Review)
def update_provider_stats_on_review_created(sender, instance, created, **kwargs):
    """
    Recalculate provider statistics when a review is created or updated.
    
    Ensures provider's avg_rating, review_count, and trust_score
    are always in sync with reviews.
    """
    if created:
        update_provider_stats(instance.provider)


@receiver(post_delete, sender=Review)
def update_provider_stats_on_review_deleted(sender, instance, **kwargs):
    """
    Recalculate provider statistics when a review is deleted.
    
    Maintains data consistency when reviews are removed.
    """
    update_provider_stats(instance.provider)


@receiver(post_save, sender=TechnicianReview)
def update_technician_stats_on_review_created(sender, instance, created, **kwargs):
    """
    Recalculate technician statistics when a review is created or updated.
    
    Ensures technician's avg_rating, review_count, and trust_score
    are always in sync with reviews.
    """
    if created:
        update_technician_stats(instance.technician)


@receiver(post_delete, sender=TechnicianReview)
def update_technician_stats_on_review_deleted(sender, instance, **kwargs):
    """
    Recalculate technician statistics when a review is deleted.
    
    Maintains data consistency when reviews are removed.
    """
    update_technician_stats(instance.technician)
