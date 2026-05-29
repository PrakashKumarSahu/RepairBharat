from django.urls import path
from .views import InventoryItemListCreateView, InventoryItemDetailView

urlpatterns = [
    path("", InventoryItemListCreateView.as_view(), name="inventory-list-create"),
    path("<int:pk>/", InventoryItemDetailView.as_view(), name="inventory-detail"),
]
