import django_filters
from .models import InventoryItem


class InventoryItemFilter(django_filters.FilterSet):
    branch = django_filters.NumberFilter(field_name='branch__id')
    category = django_filters.CharFilter(lookup_expr='iexact')
    low_stock = django_filters.BooleanFilter(method='filter_low_stock')

    def filter_low_stock(self, queryset, name, value):
        if value:
            from django.db.models import F
            return queryset.filter(stock_level__lte=F('low_stock_threshold'))
        return queryset

    class Meta:
        model = InventoryItem
        fields = ['branch', 'category', 'low_stock']
