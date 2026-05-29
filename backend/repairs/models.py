import uuid
from django.db import models
from core.models import TimeStampedModel
from accounts.models import CustomUser
from organizations.models import Branch
from providers.models import Technician
from devices.models import Device
from workflow.models import WorkflowStage


class RepairOrder(TimeStampedModel):
    class Priorities(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"

    ticket_number = models.CharField(max_length=50, unique=True, editable=False)
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="repair_orders"
    )
    customer = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="repair_orders"
    )
    device = models.ForeignKey(
        Device,
        on_delete=models.CASCADE,
        related_name="repair_orders"
    )
    assigned_technician = models.ForeignKey(
        Technician,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="repair_orders"
    )
    issue_reported = models.TextField()
    diagnostics_notes = models.TextField(blank=True)
    status = models.ForeignKey(
        WorkflowStage,
        on_delete=models.PROTECT,
        related_name="repair_orders"
    )
    priority = models.CharField(
        max_length=20,
        choices=Priorities.choices,
        default=Priorities.MEDIUM
    )
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    advance_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def save(self, *args, **kwargs):
        if not self.ticket_number:
            unique_suffix = uuid.uuid4().hex[:6].upper()
            self.ticket_number = f"RB-2026-{unique_suffix}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.ticket_number} - {self.device.brand} {self.device.model}"


class RepairOrderHistory(TimeStampedModel):
    repair_order = models.ForeignKey(
        RepairOrder,
        on_delete=models.CASCADE,
        related_name="history"
    )
    stage = models.ForeignKey(
        WorkflowStage,
        on_delete=models.PROTECT
    )
    notes = models.TextField(blank=True)
    updated_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True
    )

    def __str__(self):
        return f"{self.repair_order.ticket_number} - {self.stage.name} - {self.updated_by.username if self.updated_by else 'System'}"
