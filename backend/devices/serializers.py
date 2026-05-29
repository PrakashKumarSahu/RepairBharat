from rest_framework import serializers
from .models import Device


class DeviceSerializer(serializers.ModelSerializer):
    customer_username = serializers.CharField(source="customer.username", read_only=True)

    class Meta:
        model = Device
        fields = "__all__"
        read_only_fields = ("id", "customer", "created_at", "updated_at")
