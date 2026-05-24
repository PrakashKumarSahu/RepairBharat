from django.conf import settings
from django.db import models


class UserProfile(models.Model):
    CUSTOMER = 'customer'
    TECHNICIAN = 'technician'
    PROVIDER = 'provider'
    ADMIN = 'admin'

    ROLE_CHOICES = [
        (CUSTOMER, 'Customer'),
        (TECHNICIAN, 'Technician'),
        (PROVIDER, 'Provider'),
        (ADMIN, 'Admin'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=CUSTOMER)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['role'], name='accounts_us_role_98cae3_idx'),
        ]

    def __str__(self):
        return f'{self.user.get_username()} ({self.get_role_display()})'
