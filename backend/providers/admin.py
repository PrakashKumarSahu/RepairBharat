from django.contrib import admin

from .models import Provider, ProviderService, Review, Technician


class ProviderServiceInline(admin.TabularInline):
    model = ProviderService
    extra = 0


class TechnicianInline(admin.TabularInline):
    model = Technician
    extra = 0
    fields = ('user', 'specialization', 'years_of_experience', 'is_available', 'is_active')
    autocomplete_fields = ('user',)


@admin.register(Provider)
class ProviderAdmin(admin.ModelAdmin):
    """Admin interface for repair shops/service centers."""
    list_display = ('shop_name', 'owner', 'verified', 'avg_rating', 'trust_score', 'technician_count', 'is_active')
    list_filter = ('verified', 'is_active', 'is_open', 'created_at')
    search_fields = ('shop_name', 'bio', 'owner__first_name', 'owner__last_name', 'owner__username')
    readonly_fields = ('avg_rating', 'review_count', 'trust_score', 'created_at', 'updated_at')
    autocomplete_fields = ('owner',)
    inlines = (TechnicianInline, ProviderServiceInline)

    fieldsets = (
        ('Owner & Shop Info', {
            'fields': ('owner', 'shop_name', 'bio', 'profile_image')
        }),
        ('Verification & Status', {
            'fields': ('verified', 'is_active', 'is_open')
        }),
        ('Location', {
            'fields': ('location', 'address')
        }),
        ('Shop Capabilities', {
            'fields': ('specialization', 'supported_brands')
        }),
        ('Stats & Metrics', {
            'fields': (
                'avg_rating', 'review_count', 'jobs_completed',
                'repeat_customer_rate', 'trust_score',
                'average_response_time_minutes'
            )
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('owner').prefetch_related('technicians')

    def technician_count(self, obj):
        return obj.technicians.count()


@admin.register(Technician)
class TechnicianAdmin(admin.ModelAdmin):
    """Admin interface for individual repair workers."""
    list_display = ('user', 'provider', 'specialization', 'years_of_experience', 'is_available', 'is_active')
    list_filter = ('is_available', 'is_active', 'provider')
    search_fields = ('user__first_name', 'user__last_name', 'user__username', 'provider__shop_name', 'specialization')
    autocomplete_fields = ('user', 'provider')


@admin.register(ProviderService)
class ProviderServiceAdmin(admin.ModelAdmin):
    """Admin interface for services offered by a provider."""
    list_display = ('name', 'provider', 'estimated_price', 'duration_minutes', 'is_available')
    list_filter = ('is_available', 'provider', 'created_at')
    search_fields = ('name', 'provider__shop_name')
    autocomplete_fields = ('provider',)
    fieldsets = (
        ('Service Info', {
            'fields': ('provider', 'name', 'description')
        }),
        ('Pricing & Duration', {
            'fields': ('estimated_price', 'duration_minutes')
        }),
        ('Status', {
            'fields': ('is_available',)
        }),
    )


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """Admin interface for provider reviews."""
    list_display = ('provider', 'customer', 'rating', 'is_verified_purchase', 'created_at')
    list_filter = ('rating', 'is_verified_purchase', 'created_at')
    search_fields = ('provider__shop_name', 'customer__first_name', 'comment')
    readonly_fields = ('created_at', 'updated_at')
    autocomplete_fields = ('provider', 'customer')
    fieldsets = (
        ('Review Info', {
            'fields': ('provider', 'customer', 'rating', 'comment')
        }),
        ('Customer', {
            'fields': ('customer_image', 'is_verified_purchase')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
