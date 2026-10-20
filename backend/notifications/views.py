from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """GET /api/notifications/ — list the logged-in user's notifications."""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)[:50]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_read(request):
    """POST /api/notifications/mark-read/ — mark all as read."""
    Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return Response({'status': 'ok', 'marked_read': True})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def unread_count(request):
    """GET /api/notifications/unread-count/ — returns {count: N}."""
    count = Notification.objects.filter(recipient=request.user, is_read=False).count()
    return Response({'count': count})
