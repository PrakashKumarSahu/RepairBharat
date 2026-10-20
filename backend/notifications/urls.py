from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('mark-read/', views.mark_all_read, name='notification-mark-read'),
    path('unread-count/', views.unread_count, name='notification-unread-count'),
]
