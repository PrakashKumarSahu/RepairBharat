from rest_framework import serializers
from .models import RepairOrder, RepairOrderHistory
from devices.serializers import DeviceSerializer
from workflow.serializers import WorkflowStageSerializer


class RepairOrderHistorySerializer(serializers.ModelSerializer):
    stage_name = serializers.CharField(source="stage.name", read_only=True)
    stage_code = serializers.CharField(source="stage.code", read_only=True)
    stage_color = serializers.CharField(source="stage.color_hex", read_only=True)
    updated_by_username = serializers.CharField(source="updated_by.username", read_only=True, default="System")

    class Meta:
        model = RepairOrderHistory
        fields = (
            "id",
            "stage_name",
            "stage_code",
            "stage_color",
            "notes",
            "updated_by_username",
            "created_at",
            "updated_at"
        )


class RepairOrderSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    customer_username = serializers.CharField(source="customer.username", read_only=True)
    customer_phone = serializers.CharField(source="customer.phone", read_only=True)
    technician_name = serializers.CharField(source="assigned_technician.user.username", read_only=True, default="Not Assigned")
    
    device_brand = serializers.CharField(source="device.brand", read_only=True)
    device_model = serializers.CharField(source="device.model", read_only=True)
    device_category = serializers.CharField(source="device.category", read_only=True)
    device_serial = serializers.CharField(source="device.serial_number_or_imei", read_only=True)

    status_code = serializers.CharField(source="status.code", read_only=True)
    status_name = serializers.CharField(source="status.name", read_only=True)
    status_color = serializers.CharField(source="status.color_hex", read_only=True)

    history = RepairOrderHistorySerializer(many=True, read_only=True)

    class Meta:
        model = RepairOrder
        fields = (
            "id",
            "ticket_number",
            "branch",
            "branch_name",
            "customer",
            "customer_username",
            "customer_phone",
            "device",
            "device_brand",
            "device_model",
            "device_category",
            "device_serial",
            "assigned_technician",
            "technician_name",
            "issue_reported",
            "diagnostics_notes",
            "status",
            "status_code",
            "status_name",
            "status_color",
            "priority",
            "estimated_cost",
            "advance_paid",
            "device_image",
            "created_at",
            "updated_at",
            "history",
        )
        read_only_fields = ("id", "ticket_number", "created_at", "updated_at")
