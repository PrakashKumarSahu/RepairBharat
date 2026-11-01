import django_filters
from .models import GSTInvoice


class GSTInvoiceFilter(django_filters.FilterSet):
    payment_status = django_filters.CharFilter(lookup_expr='iexact')
    created_after = django_filters.DateFilter(field_name='created_at', lookup_expr='date__gte')
    created_before = django_filters.DateFilter(field_name='created_at', lookup_expr='date__lte')

    class Meta:
        model = GSTInvoice
        fields = ['payment_status', 'created_after', 'created_before']
