import uuid
from django.db import models
from repairs.models import RepairOrder


class GSTInvoice(models.Model):
    class PaymentStatuses(models.TextChoices):
        UNPAID = "unpaid", "Unpaid"
        PAID = "paid", "Paid"

    class PaymentMethods(models.TextChoices):
        UPI = "upi", "UPI"
        CASH = "cash", "Cash"
        CARD = "card", "Debit/Credit Card"
        NET_BANKING = "net_banking", "Net Banking"

    ticket = models.OneToOneField(
        RepairOrder,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invoice"
    )
    invoice_number = models.CharField(max_length=50, unique=True, editable=False)
    labor_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    labor_gst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)
    cgst = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    sgst = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    igst = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    grand_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatuses.choices,
        default=PaymentStatuses.UNPAID
    )
    payment_method = models.CharField(
        max_length=30,
        choices=PaymentMethods.choices,
        default=PaymentMethods.UPI
    )
    
    # GST Compliant Physical Billing Fields
    shop_gstin = models.CharField(max_length=15, default="27AAAAA1111A1Z1")
    customer_gstin = models.CharField(max_length=15, blank=True, null=True)
    billing_address = models.TextField(blank=True, null=True)
    manual_items = models.TextField(blank=True, null=True, default="[]")

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            unique_suffix = uuid.uuid4().hex[:6].upper()
            self.invoice_number = f"RB-INV-{unique_suffix}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.invoice_number} (Total: ₹{self.grand_total})"
