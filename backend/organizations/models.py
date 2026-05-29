from django.db import models
from core.models import TimeStampedModel
from accounts.models import ShopOwnerProfile


class Organization(TimeStampedModel):
    owner = models.ForeignKey(
        ShopOwnerProfile,
        on_delete=models.CASCADE,
        related_name="organizations"
    )
    name = models.CharField(max_length=255)
    gst_number = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.name


class Branch(TimeStampedModel):
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="branches"
    )
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    specialties = models.CharField(
        max_length=255,
        default="Mobiles, Laptops, Electronics",
        help_text="Comma separated specialties"
    )
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.5)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, default=19.0760)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, default=72.8777)
    gst_number = models.CharField(max_length=50, blank=True, default="27AAAAA1111A1Z1")

    def __str__(self):
        return f"{self.name} ({self.city})"
