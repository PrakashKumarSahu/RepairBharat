from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender='repairs.RepairOrderHistory')
def notify_on_stage_change(sender, instance, created, **kwargs):
    if not created:
        return
    try:
        from .services import send_repair_status_notification
        send_repair_status_notification(
            repair_order=instance.repair_order,
            new_stage_name=instance.stage.name if instance.stage else 'Unknown',
        )
    except Exception as exc:
        import logging
        logging.getLogger(__name__).error('Notification signal error: %s', exc)
