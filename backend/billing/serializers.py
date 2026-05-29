from rest_framework import serializers
from .models import GSTInvoice


class GSTInvoiceSerializer(serializers.ModelSerializer):
    ticket_number = serializers.CharField(source="ticket.ticket_number", read_only=True)
    device = serializers.SerializerMethodField()

    class Meta:
        model = GSTInvoice
        fields = "__all__"
        read_only_fields = ("id", "invoice_number", "created_at")

    def get_device(self, obj):
        return f"{obj.ticket.device_brand} {obj.ticket.device_model}"
