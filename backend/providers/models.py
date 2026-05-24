from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User


class Provider(models.Model):
    """
    Provider model representing a repair shop, business, or service center.
    """
    owner = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='owned_provider',
        db_column='user_id',
    )
    shop_name = models.CharField(max_length=255)
    bio = models.TextField(blank=True, default='')
    profile_image = models.URLField(blank=True, default='')
    verified = models.BooleanField(default=False)
    
    # Location data stored as {"lat": number, "lng": number} for local SQLite development.
    location = models.JSONField(null=True, blank=True)
    address = models.CharField(max_length=500, blank=True, default='')
    
    # Stats and metrics
    avg_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0, 
                                     validators=[MinValueValidator(0), MaxValueValidator(5)])
    review_count = models.IntegerField(default=0)
    jobs_completed = models.IntegerField(default=0)
    repeat_customer_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0,
                                               validators=[MinValueValidator(0), MaxValueValidator(100)])
    trust_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0,
                                      validators=[MinValueValidator(0), MaxValueValidator(100)])
    average_response_time_minutes = models.IntegerField(default=0)
    
    # Experience
    years_of_experience = models.IntegerField(default=0)
    specialization = models.CharField(max_length=255, blank=True, default='')
    supported_brands = models.JSONField(default=list, blank=True)
    
    # Status
    is_open = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-trust_score', '-avg_rating']
        indexes = [
            models.Index(fields=['verified', 'trust_score']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.shop_name} - {self.owner.get_full_name()}"
    
    def calculate_trust_score(self):
        """
        Calculate trust score using formula:
        trust_score = (avg_rating * 0.5) + (repeat_customer_rate * 0.3) + (response_speed_score * 0.2)
        
        Response speed score is normalized: 100 - (response_time / 60 * 100), capped at 100
        """
        from .services.trust_score import calculate_provider_trust_score
        return calculate_provider_trust_score(self)


class Technician(models.Model):
    """
    Individual repair worker employed by a provider/shop with independent stats and services.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='technician_profile')
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE, related_name='technicians')
    specialization = models.CharField(max_length=255, blank=True, default='')
    years_of_experience = models.IntegerField(default=0)
    is_available = models.BooleanField(default=True)
    profile_image = models.URLField(blank=True, default='')
    skill_tags = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    
    # Stats and metrics (independent from provider)
    avg_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0, 
                                     validators=[MinValueValidator(0), MaxValueValidator(5)])
    review_count = models.IntegerField(default=0)
    jobs_completed = models.IntegerField(default=0)
    repeat_customer_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0,
                                               validators=[MinValueValidator(0), MaxValueValidator(100)])
    trust_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0,
                                      validators=[MinValueValidator(0), MaxValueValidator(100)])
    average_response_time_minutes = models.IntegerField(default=0)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-trust_score', '-avg_rating']
        indexes = [
            models.Index(fields=['provider', 'is_active'], name='providers_t_provide_0b0f95_idx'),
            models.Index(fields=['is_available'], name='providers_t_is_avai_31ca6a_idx'),
            models.Index(fields=['trust_score', 'avg_rating']),
        ]

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.provider.shop_name}"

    def calculate_trust_score(self):
        """
        Calculate trust score using formula:
        trust_score = (avg_rating * 0.5) + (repeat_customer_rate * 0.3) + (response_speed_score * 0.2)
        
        Response speed score is normalized: 100 - (response_time / 60 * 100), capped at 100
        """
        from .services.trust_score import calculate_technician_trust_score
        return calculate_technician_trust_score(self)


class ProviderService(models.Model):
    """
    Services offered by a provider with pricing and duration information.
    """
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    estimated_price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_minutes = models.IntegerField(null=True, blank=True)
    is_available = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['provider', 'is_available']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.provider.shop_name}"


class Review(models.Model):
    """
    Customer reviews for providers with ratings and comments.
    """
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE, related_name='reviews')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='provider_reviews')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True, default='')
    customer_image = models.URLField(blank=True, default='')
    is_verified_purchase = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ('provider', 'customer')
        indexes = [
            models.Index(fields=['provider', '-created_at']),
            models.Index(fields=['rating']),
        ]
    
    def __str__(self):
        return f"Review by {self.customer.get_full_name()} for {self.provider.shop_name}"


class TechnicianService(models.Model):
    """
    Services offered by individual technicians with pricing and duration information.
    """
    technician = models.ForeignKey(Technician, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    estimated_price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_minutes = models.IntegerField(null=True, blank=True)
    is_available = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['technician', 'is_available']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.technician.user.get_full_name()}"


class TechnicianReview(models.Model):
    """
    Customer reviews for individual technicians with ratings and comments.
    """
    technician = models.ForeignKey(Technician, on_delete=models.CASCADE, related_name='reviews')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='technician_reviews')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True, default='')
    customer_image = models.URLField(blank=True, default='')
    is_verified_purchase = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ('technician', 'customer')
        indexes = [
            models.Index(fields=['technician', '-created_at']),
            models.Index(fields=['rating']),
        ]
    
    def __str__(self):
        return f"Review by {self.customer.get_full_name()} for {self.technician.user.get_full_name()}"
