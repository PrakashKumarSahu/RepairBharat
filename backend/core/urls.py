from django.urls import path
from rest_framework import generics, permissions, serializers
from rest_framework.response import Response
from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        from core.models import ActivityLog as AL
        model = AL
        fields = ['id', 'username', 'action', 'resource_type', 'resource_id', 'metadata', 'ip_address', 'created_at']


class ActivityLogListView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'shop_owner':
            return ActivityLog.objects.none()
        return ActivityLog.objects.filter(
            user__in=__import__('accounts.models', fromlist=['CustomUser']).CustomUser.objects.filter(
                role__in=['shop_owner', 'technician']
            )
        )[:200]


urlpatterns = [
    path('', ActivityLogListView.as_view(), name='audit-log-list'),
]
