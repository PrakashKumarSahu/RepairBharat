from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import (
    CustomUser,
    CustomerProfile,
    TechnicianProfile,
    ShopOwnerProfile
)


@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):

    if not created:
        return

    if instance.role == CustomUser.Roles.CUSTOMER:
        CustomerProfile.objects.create(user=instance)

    elif instance.role == CustomUser.Roles.TECHNICIAN:
        TechnicianProfile.objects.create(user=instance)
        try:
            from providers.models import Technician as NewTechnician
            NewTechnician.objects.create(user=instance)
        except Exception:
            pass

    elif instance.role == CustomUser.Roles.SHOP_OWNER:
        ShopOwnerProfile.objects.create(
            user=instance,
            shop_name="",
            shop_address=""
        )