from django.db import models
from organizations.models import Branch


class InventoryItem(models.Model):
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="inventory_items"
    )
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100)
    category = models.CharField(max_length=100, default="Spares")
    stock_level = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=5)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    hsn_code = models.CharField(max_length=20, default="8517")
    gst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)
    image = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - SKU: {self.sku} (Branch: {self.branch.name})"
