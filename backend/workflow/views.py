from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import WorkflowStage
from .serializers import WorkflowStageSerializer


class WorkflowStageListCreateView(generics.ListCreateAPIView):
    queryset = WorkflowStage.objects.all().order_by("order")
    serializer_class = WorkflowStageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        if self.request.user.role != 'shop_owner':
            raise PermissionDenied('Only shop owners can create workflow stages.')
        serializer.save()
