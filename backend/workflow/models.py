from django.db import models
from core.models import TimeStampedModel


class WorkflowStage(TimeStampedModel):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)
    color_hex = models.CharField(max_length=7, default="#7c6cff")

    def __str__(self):
        return f"{self.name} ({self.code})"
