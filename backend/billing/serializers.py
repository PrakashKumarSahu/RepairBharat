from rest_framework import serializers
from .models import GSTInvoice


class GSTInvoiceSerializer(serializers.ModelSerializer):
    ticket_number = serializers.SerializerMethodField()
    device = serializers.SerializerMethodField()

    class Meta:
        model = GSTInvoice
        fields = "__all__"
        read_only_fields = ("id", "invoice_number", "created_at")

    def get_ticket_number(self, obj):
        if obj.ticket:
            return obj.ticket.ticket_number
        return "N/A"

    def get_device(self, obj):
        if obj.ticket and obj.ticket.device:
            return f"{obj.ticket.device.brand} {obj.ticket.device.model}"
        return "Manual Invoice"
