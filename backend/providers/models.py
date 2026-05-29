from django.db import models
from core.models import TimeStampedModel
from accounts.models import CustomUser, ShopOwnerProfile
from organizations.models import Branch


class Skill(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Technician(TimeStampedModel):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="technician_profile_new"
    )
    skills = models.ManyToManyField(Skill, blank=True)
    experience_years = models.PositiveIntegerField(default=0)
    is_verified = models.BooleanField(default=False)
    shop = models.ForeignKey(
        ShopOwnerProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="technicians_new"
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="technicians"
    )

    def __str__(self):
        return f"{self.user.username} - Verified: {self.is_verified}"


class TechnicianJoinRequest(TimeStampedModel):
    class Statuses(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    technician = models.ForeignKey(
        Technician,
        on_delete=models.CASCADE,
        related_name="join_requests"
    )
    shop = models.ForeignKey(
        ShopOwnerProfile,
        on_delete=models.CASCADE,
        related_name="join_requests"
    )
    status = models.CharField(
        max_length=20,
        choices=Statuses.choices,
        default=Statuses.PENDING
    )

    class Meta:
        unique_together = ("technician", "shop")

    def __str__(self):
        return f"{self.technician.user.username} request to {self.shop.shop_name} ({self.status})"
