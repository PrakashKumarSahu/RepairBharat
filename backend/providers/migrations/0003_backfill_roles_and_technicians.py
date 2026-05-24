from django.db import migrations


def backfill_roles_and_technicians(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    UserProfile = apps.get_model('accounts', 'UserProfile')
    Provider = apps.get_model('providers', 'Provider')
    Technician = apps.get_model('providers', 'Technician')
    Review = apps.get_model('providers', 'Review')

    for user in User.objects.all():
        UserProfile.objects.get_or_create(user=user, defaults={'role': 'customer'})

    customer_ids = Review.objects.values_list('customer_id', flat=True).distinct()
    UserProfile.objects.filter(user_id__in=customer_ids).update(role='customer')

    for provider in Provider.objects.select_related('owner'):
        UserProfile.objects.update_or_create(
            user=provider.owner,
            defaults={'role': 'provider'},
        )

        if Technician.objects.filter(provider=provider).exists():
            continue

        owner = provider.owner
        username = f'{owner.username}_technician'
        technician_user, _ = User.objects.get_or_create(
            username=username,
            defaults={
                'first_name': owner.first_name,
                'last_name': owner.last_name,
                'email': f'{username}@repairbharat.local',
            },
        )
        UserProfile.objects.update_or_create(
            user=technician_user,
            defaults={'role': 'technician'},
        )
        Technician.objects.create(
            user=technician_user,
            provider=provider,
            specialization=provider.specialization,
            years_of_experience=provider.years_of_experience,
            is_available=provider.is_open,
            profile_image=provider.profile_image,
            skill_tags=provider.supported_brands or [],
        )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
        ('providers', '0002_provider_owner_and_technician'),
    ]

    operations = [
        migrations.RunPython(backfill_roles_and_technicians, noop_reverse),
    ]
