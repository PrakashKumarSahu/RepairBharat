from django.urls import path
from .views import GSTInvoiceListCreateView, GSTInvoiceDetailView

urlpatterns = [
    path("", GSTInvoiceListCreateView.as_view(), name="invoice-list-create"),
    path("<int:pk>/", GSTInvoiceDetailView.as_view(), name="invoice-detail"),
]
