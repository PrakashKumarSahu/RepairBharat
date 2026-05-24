"""
Django REST Framework serializers for Provider, ProviderService, Review, Technician, and related models.
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Provider, ProviderService, Review, Technician, TechnicianService, TechnicianReview


class UserSerializer(serializers.ModelSerializer):
    """Serialize User model for nested use."""
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'role']
        read_only_fields = ['id']

    def get_role(self, obj):
        profile = getattr(obj, 'profile', None)
        return profile.role if profile else 'customer'


class TechnicianSerializer(serializers.ModelSerializer):
    """Serialize a technician employed by a provider."""
    user = UserSerializer(read_only=True)
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = Technician
        fields = [
            'id',
            'user',
            'name',
            'specialization',
            'years_of_experience',
            'is_available',
            'profile_image',
            'skill_tags',
            'avg_rating',
            'review_count',
            'trust_score',
        ]
        read_only_fields = ['id', 'avg_rating', 'review_count', 'trust_score']

    def get_name(self, obj):
        name = obj.user.get_full_name().strip()
        return name or obj.user.get_username()


class TechnicianDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for individual technician with stats and services."""
    user = UserSerializer(read_only=True)
    name = serializers.SerializerMethodField()
    services = serializers.SerializerMethodField()
    avg_rating = serializers.DecimalField(max_digits=3, decimal_places=2, read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    trust_score = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = Technician
        fields = [
            'id',
            'user',
            'name',
            'specialization',
            'years_of_experience',
            'is_available',
            'profile_image',
            'skill_tags',
            'avg_rating',
            'review_count',
            'jobs_completed',
            'repeat_customer_rate',
            'trust_score',
            'average_response_time_minutes',
            'services',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'avg_rating',
            'review_count',
            'trust_score',
            'created_at',
            'updated_at',
        ]
    
    def get_name(self, obj):
        name = obj.user.get_full_name().strip()
        return name or obj.user.get_username()
    
    def get_services(self, obj):
        services = obj.services.filter(is_available=True)
        return TechnicianServiceSerializer(services, many=True).data


class ProviderServiceSerializer(serializers.ModelSerializer):
    """Serialize ProviderService model."""
    class Meta:
        model = ProviderService
        fields = [
            'id',
            'name',
            'description',
            'estimated_price',
            'duration_minutes',
            'is_available',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TechnicianServiceSerializer(serializers.ModelSerializer):
    """Serialize TechnicianService model for services offered by individual technicians."""
    class Meta:
        model = TechnicianService
        fields = [
            'id',
            'name',
            'description',
            'estimated_price',
            'duration_minutes',
            'is_available',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ReviewSerializer(serializers.ModelSerializer):
    """Serialize Review model with customer details."""
    customer = UserSerializer(read_only=True)
    customer_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id',
            'rating',
            'comment',
            'customer',
            'customer_id',
            'customer_image',
            'is_verified_purchase',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Create a new review."""
        customer_id = validated_data.pop('customer_id')
        try:
            customer = User.objects.get(id=customer_id)
            validated_data['customer'] = customer
        except User.DoesNotExist:
            raise serializers.ValidationError({'customer_id': 'User not found.'})
        
        return super().create(validated_data)


class ProviderDetailSerializer(serializers.ModelSerializer):
    """
    Detailed provider serializer with all related data.
    Used for the detail page endpoint.
    """
    owner = UserSerializer(read_only=True)
    user = UserSerializer(source='owner', read_only=True)
    services = ProviderServiceSerializer(many=True, read_only=True)
    technicians = TechnicianDetailSerializer(many=True, read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    avg_rating = serializers.DecimalField(max_digits=3, decimal_places=2, read_only=True)
    trust_score = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = Provider
        fields = [
            'id',
            'owner',
            'user',
            'shop_name',
            'bio',
            'profile_image',
            'verified',
            'address',
            'avg_rating',
            'review_count',
            'jobs_completed',
            'repeat_customer_rate',
            'trust_score',
            'average_response_time_minutes',
            'years_of_experience',
            'specialization',
            'supported_brands',
            'is_open',
            'is_active',
            'services',
            'technicians',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'avg_rating',
            'review_count',
            'trust_score',
            'created_at',
            'updated_at',
        ]


class ProviderListSerializer(serializers.ModelSerializer):
    """
    Lightweight provider serializer for list endpoints.
    Excludes heavy relations to improve performance.
    """
    owner = UserSerializer(read_only=True)
    user = UserSerializer(source='owner', read_only=True)
    technician_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Provider
        fields = [
            'id',
            'owner',
            'user',
            'shop_name',
            'profile_image',
            'verified',
            'avg_rating',
            'review_count',
            'address',
            'is_open',
            'trust_score',
            'technician_count',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ReviewListSerializer(serializers.ModelSerializer):
    """
    Review serializer for list endpoints with pagination.
    """
    customer = UserSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id',
            'rating',
            'comment',
            'customer',
            'customer_image',
            'is_verified_purchase',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ProviderStatsSerializer(serializers.Serializer):
    """
    Serializer for provider statistics summary.
    """
    jobs_completed = serializers.IntegerField()
    repeat_customer_percentage = serializers.FloatField()
    average_response_time_minutes = serializers.IntegerField()
    trust_score = serializers.FloatField()
    average_rating = serializers.FloatField()
    review_count = serializers.IntegerField()
    verified = serializers.BooleanField()
    years_of_experience = serializers.IntegerField()


class TechnicianReviewSerializer(serializers.ModelSerializer):
    """Serialize TechnicianReview model with customer details."""
    customer = UserSerializer(read_only=True)
    customer_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = TechnicianReview
        fields = [
            'id',
            'rating',
            'comment',
            'customer',
            'customer_id',
            'customer_image',
            'is_verified_purchase',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Create a new technician review."""
        customer_id = validated_data.pop('customer_id')
        try:
            customer = User.objects.get(id=customer_id)
            validated_data['customer'] = customer
        except User.DoesNotExist:
            raise serializers.ValidationError({'customer_id': 'User not found.'})
        
        return super().create(validated_data)


class TechnicianReviewListSerializer(serializers.ModelSerializer):
    """Technician review serializer for list endpoints with pagination."""
    customer = UserSerializer(read_only=True)
    
    class Meta:
        model = TechnicianReview
        fields = [
            'id',
            'rating',
            'comment',
            'customer',
            'customer_image',
            'is_verified_purchase',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class TechnicianStatsSerializer(serializers.Serializer):
    """Serializer for technician statistics summary."""
    jobs_completed = serializers.IntegerField()
    repeat_customer_percentage = serializers.FloatField()
    average_response_time_minutes = serializers.IntegerField()
    trust_score = serializers.FloatField()
    average_rating = serializers.FloatField()
    review_count = serializers.IntegerField()
    years_of_experience = serializers.IntegerField()
