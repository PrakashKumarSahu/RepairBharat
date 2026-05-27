from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):

    class Roles(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        TECHNICIAN = "technician", "Technician"
        SHOP_OWNER = "shop_owner", "Shop Owner"

    role = models.CharField(
        max_length=20,
        choices=Roles.choices
    )

    phone = models.CharField(
        max_length=20,
        blank=True
    )


    address = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username


class CustomerProfile(models.Model):

    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="customer_profile"
    )

    preferred_service_area = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.username} Customer Profile"


class ShopOwnerProfile(models.Model):

    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="shop_owner_profile"
    )

    shop_name = models.CharField(max_length=255)
    shop_address = models.TextField()

    gst_number = models.CharField(
        max_length=50,
        blank=True
    )

    def __str__(self):
        return self.shop_name


class TechnicianProfile(models.Model):

    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="technician_profile"
    )

    skills = models.CharField(max_length=255)

    experience_years = models.PositiveIntegerField(default=0)

    is_verified = models.BooleanField(default=False)

    service_radius_km = models.PositiveIntegerField(default=10)

    shop = models.ForeignKey(
        ShopOwnerProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="technicians"
    )

    def __str__(self):
        return f"{self.user.username} Technician Profile"