from rest_framework import serializers
from .models import WorkflowStage


class WorkflowStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowStage
        fields = "__all__"
