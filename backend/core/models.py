from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class ActivityLog(models.Model):
    """Audit trail — records user actions on key resources."""
    user = models.ForeignKey(
        'accounts.CustomUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activity_logs',
    )
    action = models.CharField(max_length=100)  # e.g. 'ticket.create', 'invoice.paid'
    resource_type = models.CharField(max_length=50)  # e.g. 'RepairOrder', 'GSTInvoice'
    resource_id = models.IntegerField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.action} by {self.user} on {self.resource_type}#{self.resource_id}'

