from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['recipient', 'notification_type', 'title', 'status', 'is_read', 'created_at']
    list_filter = ['notification_type', 'status', 'is_read']
    search_fields = ['recipient__username', 'title', 'body']
    readonly_fields = ['created_at']
