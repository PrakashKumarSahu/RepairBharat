from django.urls import path
from rest_framework import generics, permissions, serializers
from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = ['id', 'username', 'action', 'resource_type', 'resource_id', 'metadata', 'ip_address', 'created_at']

    def get_username(self, obj):
        return obj.user.username if obj.user else 'system'


class ActivityLogListView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'shop_owner':
            return ActivityLog.objects.none()
        return ActivityLog.objects.select_related('user').order_by('-created_at')[:200]

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        serializer = self.get_serializer(list(qs), many=True)
        from rest_framework.response import Response
        return Response(serializer.data)


urlpatterns = [
    path('', ActivityLogListView.as_view(), name='audit-log-list'),
]
