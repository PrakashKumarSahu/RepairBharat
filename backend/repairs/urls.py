from django.urls import path
from .views import RepairOrderListCreateView, RepairOrderDetailView

urlpatterns = [
    path("", RepairOrderListCreateView.as_view(), name="order-list-create"),
    path("<int:pk>/", RepairOrderDetailView.as_view(), name="order-detail"),
]
