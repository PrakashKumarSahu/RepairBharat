from django.db import models
from accounts.models import CustomUser


class Notification(models.Model):
    class Types(models.TextChoices):
        SMS = 'sms', 'SMS'
        IN_APP = 'in_app', 'In-App'

    class Statuses(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SENT = 'sent', 'Sent'
        FAILED = 'failed', 'Failed'

    recipient = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name='notifications'
    )
    notification_type = models.CharField(max_length=20, choices=Types.choices, default=Types.IN_APP)
    title = models.CharField(max_length=200)
    body = models.TextField()
    status = models.CharField(max_length=20, choices=Statuses.choices, default=Statuses.PENDING)
    is_read = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.notification_type}] {self.title} → {self.recipient.username}'
