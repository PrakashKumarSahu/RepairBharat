# Providers Backend Module - Setup Guide

## Overview
The providers backend module implements a complete API for technician/service provider discovery, with features for managing provider profiles, services, reviews, and trust metrics.

## Database Models

### Provider
Main provider model with location-based services using PostGIS.

**Fields:**
- `user`: OneToOne with Django User
- `shop_name`: Provider's business name
- `bio`: Business description
- `profile_image`: URL to provider profile image
- `verified`: Boolean flag for verified providers
- `location`: GIS Point field (latitude, longitude)
- `address`: String address
- `avg_rating`: Decimal (0-5), calculated from reviews
- `review_count`: Count of reviews
- `jobs_completed`: Total completed jobs
- `repeat_customer_rate`: Percentage (0-100)
- `trust_score`: Calculated metric (0-100)
- `average_response_time_minutes`: Response speed metric
- `years_of_experience`: Integer
- `specialization`: Service specialization
- `supported_brands`: JSON list of brands
- `is_open`: Current status
- `is_active`: Soft delete flag

### ProviderService
Services offered by a provider.

**Fields:**
- `provider`: ForeignKey to Provider
- `name`: Service name
- `description`: Service details
- `estimated_price`: Decimal pricing
- `duration_minutes`: Service duration
- `is_available`: Availability flag

### Review
Customer reviews with ratings.

**Fields:**
- `provider`: ForeignKey to Provider
- `customer`: ForeignKey to User
- `rating`: Integer (1-5)
- `comment`: Review text
- `customer_image`: Reviewer profile image URL
- `is_verified_purchase`: Verified review flag

## Installation

### 1. Update Django Settings

Add to `INSTALLED_APPS` in `RepairBharat/settings.py`:

```python
INSTALLED_APPS = [
    # ... existing apps
    'rest_framework',
    'django_filters',
    'django.contrib.gis',  # For PostGIS
    'providers',
]

# DRF Configuration
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
}
```

### 2. Update URL Configuration

Add to `RepairBharat/urls.py`:

```python
urlpatterns = [
    # ... existing patterns
    path('api/', include('providers.urls')),
]
```

### 3. Install Dependencies

```bash
pip install djangorestframework django-filter django-cors-headers
```

For PostGIS support:
```bash
pip install django-gis
```

### 4. Run Migrations

```bash
# Create initial migration
python manage.py makemigrations providers

# Apply migrations
python manage.py migrate providers
```

### 5. Seed Sample Data

```bash
python manage.py seed_providers
```

## API Endpoints

### Provider Endpoints

#### List Providers
```
GET /api/providers/
```

Query Parameters:
- `search`: Search by shop name
- `verified`: Filter by verified status (true/false)
- `min_rating`: Minimum average rating
- `is_open`: Filter by open status (true/false)
- `page`: Page number (default: 1)
- `page_size`: Results per page (default: 10, max: 100)

**Response:**
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "first_name": "Raj",
        "last_name": "Kumar",
        "email": "raj@example.com"
      },
      "shop_name": "Raj's Mobile Repair",
      "profile_image": "https://...",
      "verified": true,
      "avg_rating": "4.8",
      "review_count": 156,
      "address": "Karol Bagh, Delhi",
      "is_open": true,
      "trust_score": "78.50"
    }
  ]
}
```

#### Get Provider Detail
```
GET /api/providers/:id/
```

**Response:**
```json
{
  "id": 1,
  "user": {
    "id": 1,
    "first_name": "Raj",
    "last_name": "Kumar",
    "email": "raj@example.com"
  },
  "shop_name": "Raj's Mobile Repair",
  "bio": "Expert in smartphone repairs...",
  "profile_image": "https://...",
  "verified": true,
  "address": "Karol Bagh, Delhi",
  "avg_rating": "4.8",
  "review_count": 156,
  "jobs_completed": 250,
  "repeat_customer_rate": "68.50",
  "trust_score": "78.50",
  "average_response_time_minutes": 15,
  "years_of_experience": 8,
  "specialization": "Smartphone Repair",
  "supported_brands": ["Apple", "Samsung", "OnePlus"],
  "is_open": true,
  "is_active": true,
  "services": [
    {
      "id": 1,
      "name": "Screen Replacement",
      "description": "",
      "estimated_price": "3000.00",
      "duration_minutes": 60,
      "is_available": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### Get Provider Reviews
```
GET /api/providers/:id/reviews/
```

Query Parameters:
- `page`: Page number (default: 1)
- `page_size`: Results per page (default: 10, max: 100)

**Response:**
```json
{
  "count": 156,
  "next": "http://api/providers/1/reviews/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Excellent service!",
      "customer": {
        "id": 10,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com"
      },
      "customer_image": "https://...",
      "is_verified_purchase": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Create Review
```
POST /api/providers/:id/reviews/
```

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Great service and friendly staff!",
  "customer_id": 10,
  "customer_image": "https://...",
  "is_verified_purchase": true
}
```

**Response:** 201 Created

#### Get Provider Statistics
```
GET /api/providers/:id/stats/
```

**Response:**
```json
{
  "jobs_completed": 250,
  "repeat_customer_percentage": 68.5,
  "average_response_time_minutes": 15,
  "trust_score": 78.5,
  "average_rating": 4.8,
  "review_count": 156,
  "verified": true,
  "years_of_experience": 8
}
```

#### Get Reviews Summary
```
GET /api/providers/:id/summary/
```

Query Parameters:
- `limit`: Number of reviews to include (default: 50)

**Response:**
```json
{
  "total_reviews": 156,
  "average_rating": 4.8,
  "rating_distribution": {
    "1": 2,
    "2": 5,
    "3": 10,
    "4": 35,
    "5": 104
  },
  "reviews": [...]
}
```

## Service Layer

### Trust Score Calculation

Located in `providers/services/trust_score.py`

**Formula:**
```
trust_score = (avg_rating * 0.5) + (repeat_customer_rate * 0.3) + (response_speed_score * 0.2)
```

Where:
- `avg_rating`: Normalized to 0-100 scale (multiply by 20)
- `repeat_customer_rate`: Already in 0-100 range
- `response_speed_score`: 100 - (response_time_minutes / 60 * 100), capped at 0-100

### Provider Statistics

Located in `providers/services/provider_stats.py`

Includes functions for:
- `update_provider_stats()`: Recalculate stats from reviews
- `get_provider_reviews_summary()`: Aggregated review data
- `get_provider_stats()`: Complete provider metrics

## Admin Interface

Access Django admin at `/admin/` with superuser credentials.

Admin features:
- Provider management with stats overview
- Service CRUD operations
- Review moderation and filtering
- Search and filtering capabilities

## Testing

### Sample Data
Run `python manage.py seed_providers` to create sample data:
- 5 providers with different ratings
- 10+ services
- Multiple reviews per provider

### Test Queries

List all providers:
```bash
curl http://localhost:8000/api/providers/
```

Get specific provider:
```bash
curl http://localhost:8000/api/providers/1/
```

Get reviews with pagination:
```bash
curl http://localhost:8000/api/providers/1/reviews/?page=1&page_size=5
```

## Performance Optimizations

1. **Database Queries**
   - Uses `select_related()` for OneToOne and ForeignKey
   - Uses `prefetch_related()` for reverse relations
   - Index on `(provider, created_at)` for review queries
   - Index on `(verified, trust_score)` for filtering

2. **Pagination**
   - Default 10 items per page
   - Configurable via `page_size` query parameter
   - Maximum 100 items per page

3. **Caching** (future enhancement)
   - Cache provider detail pages (TTL: 1 hour)
   - Invalidate cache on review creation

## Security Considerations

1. **Validation**
   - Rating must be 1-5
   - Price must be positive decimal
   - Duration must be positive integer

2. **Permissions** (future enhancement)
   - Only verified customers can review
   - Only provider can edit own profile
   - Only admin can verify providers

3. **Rate Limiting** (future enhancement)
   - Limit review creation to prevent spam
   - Limit API calls per user

## File Structure

```
providers/
├── __init__.py
├── models.py              # Django models
├── serializers.py         # DRF serializers
├── views.py              # DRF viewsets and views
├── urls.py               # URL routing
├── admin.py              # Django admin
├── apps.py               # App configuration
├── services/             # Business logic layer
│   ├── __init__.py
│   ├── trust_score.py    # Trust score calculation
│   └── provider_stats.py # Statistics functions
└── management/
    └── commands/
        └── seed_providers.py  # Sample data seeding
```
