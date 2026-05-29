from django.urls import path
from .views import RepairOrderListCreateView, RepairOrderDetailView, PublicRepairOrderTrackView

urlpatterns = [
    path("", RepairOrderListCreateView.as_view(), name="order-list-create"),
    path("<int:pk>/", RepairOrderDetailView.as_view(), name="order-detail"),
    path("public-track/<str:ticket_number>/", PublicRepairOrderTrackView.as_view(), name="public-track"),
]
