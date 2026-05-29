from rest_framework import generics, permissions
from .models import WorkflowStage
from .serializers import WorkflowStageSerializer


class WorkflowStageListCreateView(generics.ListCreateAPIView):
    queryset = WorkflowStage.objects.all().order_by("order")
    serializer_class = WorkflowStageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
