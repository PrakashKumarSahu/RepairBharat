from django.db import models
from core.models import TimeStampedModel
from accounts.models import CustomUser


class Device(TimeStampedModel):
    customer = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="devices"
    )
    category = models.CharField(max_length=100)
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    serial_number_or_imei = models.CharField(
        max_length=100,
        blank=True,
        help_text="Serial number or IMEI for unique hardware verification tracking"
    )

    def __str__(self):
        return f"{self.brand} {self.model} ({self.customer.username})"
