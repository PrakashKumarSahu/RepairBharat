"""
Django management command to seed sample provider data.

Usage:
    python manage.py seed_providers

This command creates:
- 5 sample providers with different ratings and specializations
- Services for each provider
- Sample reviews from various users
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from decimal import Decimal

from accounts.models import UserProfile
from providers.models import Provider, ProviderService, Review, Technician


class Command(BaseCommand):
    help = 'Seed sample provider data for development'
    
    def handle(self, *args, **options):
        self.stdout.write('Starting to seed provider data...')
        
        # Create sample users
        users_data = [
            {'username': 'raj_repairs', 'first_name': 'Raj', 'last_name': 'Kumar'},
            {'username': 'priya_tech', 'first_name': 'Priya', 'last_name': 'Sharma'},
            {'username': 'amit_mobile', 'first_name': 'Amit', 'last_name': 'Patel'},
            {'username': 'neha_experts', 'first_name': 'Neha', 'last_name': 'Singh'},
            {'username': 'vikram_service', 'first_name': 'Vikram', 'last_name': 'Gupta'},
        ]
        
        users = []
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'email': f"{user_data['username']}@repairbharat.com"
                }
            )
            users.append(user)
            UserProfile.objects.update_or_create(
                user=user,
                defaults={'role': UserProfile.PROVIDER},
            )
            if created:
                self.stdout.write(f"Created user: {user.username}")
        
        # Create sample providers
        providers_data = [
            {
                'owner': users[0],
                'shop_name': 'Raj\'s Mobile Repair',
                'bio': 'Expert in smartphone and tablet repairs with 8 years of experience.',
                'verified': True,
                'avg_rating': Decimal('4.8'),
                'review_count': 156,
                'jobs_completed': 250,
                'repeat_customer_rate': Decimal('68.5'),
                'average_response_time_minutes': 15,
                'years_of_experience': 8,
                'specialization': 'Smartphone Repair',
                'supported_brands': ['Apple', 'Samsung', 'OnePlus', 'Xiaomi'],
                'location': {'lat': 28.7041, 'lng': 77.1025},  # Delhi
                'address': 'Karol Bagh, Delhi',
                'is_open': True,
            },
            {
                'owner': users[1],
                'shop_name': 'Priya\'s Laptop Services',
                'bio': 'Specialized laptop repair and maintenance services.',
                'verified': True,
                'avg_rating': Decimal('4.6'),
                'review_count': 89,
                'jobs_completed': 150,
                'repeat_customer_rate': Decimal('55.3'),
                'average_response_time_minutes': 25,
                'years_of_experience': 6,
                'specialization': 'Laptop Repair',
                'supported_brands': ['Dell', 'HP', 'Lenovo', 'ASUS'],
                'location': {'lat': 28.5355, 'lng': 77.3910},  # Gurgaon
                'address': 'Sector 18, Gurgaon',
                'is_open': True,
            },
            {
                'owner': users[2],
                'shop_name': 'Amit\'s Electronics Hub',
                'bio': 'Full-service electronics repair center.',
                'verified': False,
                'avg_rating': Decimal('4.2'),
                'review_count': 45,
                'jobs_completed': 78,
                'repeat_customer_rate': Decimal('42.1'),
                'average_response_time_minutes': 45,
                'years_of_experience': 3,
                'specialization': 'Electronics',
                'supported_brands': ['LG', 'Sony', 'Samsung', 'Panasonic'],
                'location': {'lat': 28.4595, 'lng': 77.0266},  # Noida
                'address': 'Sector 62, Noida',
                'is_open': True,
            },
            {
                'owner': users[3],
                'shop_name': 'Neha\'s Premium Repairs',
                'bio': 'Premium repair services with warranty on all repairs.',
                'verified': True,
                'avg_rating': Decimal('4.9'),
                'review_count': 234,
                'jobs_completed': 380,
                'repeat_customer_rate': Decimal('72.4'),
                'average_response_time_minutes': 10,
                'years_of_experience': 10,
                'specialization': 'Multi-Device Repair',
                'supported_brands': ['Apple', 'Samsung', 'Dell', 'HP', 'Lenovo'],
                'location': {'lat': 28.6139, 'lng': 77.2090},  # South Delhi
                'address': 'Safdarjung, Delhi',
                'is_open': True,
            },
            {
                'owner': users[4],
                'shop_name': 'Vikram\'s Tech Solutions',
                'bio': 'Affordable repairs with quick turnaround time.',
                'verified': False,
                'avg_rating': Decimal('3.8'),
                'review_count': 67,
                'jobs_completed': 120,
                'repeat_customer_rate': Decimal('38.3'),
                'average_response_time_minutes': 60,
                'years_of_experience': 4,
                'specialization': 'Budget Repairs',
                'supported_brands': ['Micromax', 'Lava', 'Motorola'],
                'location': {'lat': 28.5244, 'lng': 77.0855},  # West Delhi
                'address': 'Rajouri Garden, Delhi',
                'is_open': False,
            },
        ]
        
        providers = []
        for provider_data in providers_data:
            provider, created = Provider.objects.get_or_create(
                owner=provider_data['owner'],
                defaults=provider_data
            )
            providers.append(provider)
            if created:
                self.stdout.write(f"Created provider: {provider.shop_name}")

        technician_names = [
            [('Amit', 'Sharma'), ('Suresh', 'Verma')],
            [('Karan', 'Mehta'), ('Ritika', 'Kapoor')],
            [('Farhan', 'Ali'), ('Deepak', 'Yadav')],
            [('Meera', 'Joshi'), ('Arjun', 'Rao')],
            [('Pooja', 'Nair'), ('Manish', 'Batra')],
        ]

        for provider, tech_names in zip(providers, technician_names):
            for index, (first_name, last_name) in enumerate(tech_names):
                username = f'tech_{provider.id}_{first_name.lower()}_{last_name.lower()}'
                tech_user, _ = User.objects.get_or_create(
                    username=username,
                    defaults={
                        'first_name': first_name,
                        'last_name': last_name,
                        'email': f'{username}@repairbharat.com',
                    },
                )
                UserProfile.objects.update_or_create(
                    user=tech_user,
                    defaults={'role': UserProfile.TECHNICIAN},
                )
                Technician.objects.get_or_create(
                    user=tech_user,
                    defaults={
                        'provider': provider,
                        'specialization': provider.specialization,
                        'years_of_experience': max(provider.years_of_experience - index, 1),
                        'is_available': provider.is_open,
                        'skill_tags': provider.supported_brands,
                    },
                )
        
        # Create sample services
        services_data = [
            [
                {'name': 'Screen Replacement', 'estimated_price': Decimal('3000'), 'duration_minutes': 60},
                {'name': 'Battery Replacement', 'estimated_price': Decimal('1500'), 'duration_minutes': 30},
                {'name': 'Software Fix', 'estimated_price': Decimal('500'), 'duration_minutes': 30},
            ],
            [
                {'name': 'Screen Repair', 'estimated_price': Decimal('5000'), 'duration_minutes': 90},
                {'name': 'Keyboard Replacement', 'estimated_price': Decimal('2000'), 'duration_minutes': 60},
                {'name': 'Hard Drive Upgrade', 'estimated_price': Decimal('3000'), 'duration_minutes': 120},
            ],
            [
                {'name': 'TV Screen Repair', 'estimated_price': Decimal('8000'), 'duration_minutes': 120},
                {'name': 'Power Supply Repair', 'estimated_price': Decimal('2000'), 'duration_minutes': 60},
            ],
            [
                {'name': 'Premium Screen Replacement', 'estimated_price': Decimal('12000'), 'duration_minutes': 90},
                {'name': 'Logic Board Repair', 'estimated_price': Decimal('8000'), 'duration_minutes': 180},
                {'name': 'Water Damage Repair', 'estimated_price': Decimal('5000'), 'duration_minutes': 120},
            ],
            [
                {'name': 'Basic Screen Replacement', 'estimated_price': Decimal('1500'), 'duration_minutes': 45},
                {'name': 'Battery Swap', 'estimated_price': Decimal('800'), 'duration_minutes': 20},
            ],
        ]
        
        for provider, services in zip(providers, services_data):
            for service_data in services:
                ProviderService.objects.get_or_create(
                    provider=provider,
                    name=service_data['name'],
                    defaults={
                        'estimated_price': service_data['estimated_price'],
                        'duration_minutes': service_data['duration_minutes'],
                    }
                )
            self.stdout.write(f"Created services for {provider.shop_name}")
        
        # Create sample reviews
        review_count = 0
        for provider in providers:
            # Create 5-10 reviews per provider
            num_reviews = 8 if provider.verified else 4
            for i in range(num_reviews):
                customer, created = User.objects.get_or_create(
                    username=f'customer_{provider.id}_{i}',
                    defaults={
                        'first_name': f'Customer{i}',
                        'last_name': f'User',
                    }
                )
                UserProfile.objects.update_or_create(
                    user=customer,
                    defaults={'role': UserProfile.CUSTOMER},
                )
                
                # Bias ratings towards provider's avg_rating
                rating = min(5, max(1, int(provider.avg_rating) + (i % 3 - 1)))
                
                Review.objects.get_or_create(
                    provider=provider,
                    customer=customer,
                    defaults={
                        'rating': rating,
                        'comment': f'Great service! {i+1}',
                        'is_verified_purchase': True,
                    }
                )
                review_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully seeded {len(providers)} providers with '
                f'{len(list(ProviderService.objects.all()))} services and '
                f'{review_count} reviews'
            )
        )
