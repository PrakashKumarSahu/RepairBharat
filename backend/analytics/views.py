from django.db.models import Count, Sum, Avg, Q, F
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from repairs.models import RepairOrder, RepairOrderHistory
from inventory.models import InventoryItem
from billing.models import GSTInvoice
from providers.models import Technician


def _owner_filter(request):
    """Return a Q filter for repair orders belonging to the requesting shop owner."""
    return Q(branch__organization__owner__user=request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def revenue_over_time(request):
    """GET /api/analytics/revenue/?range=30d
    Returns daily revenue totals for the specified range.
    Only accessible to shop_owner.
    """
    if request.user.role != 'shop_owner':
        return Response({'detail': 'Forbidden.'}, status=403)

    days = 90 if request.GET.get('range') == '90d' else 30
    since = timezone.now() - timedelta(days=days)

    data = (
        GSTInvoice.objects
        .filter(
            ticket__branch__organization__owner__user=request.user,
            created_at__gte=since,
            payment_status='paid',
        )
        .annotate(date=TruncDate('created_at'))
        .values('date')
        .annotate(revenue=Sum('grand_total'))
        .order_by('date')
    )

    return Response({
        'range_days': days,
        'data': [
            {'date': str(row['date']), 'revenue': float(row['revenue'] or 0)}
            for row in data
        ],
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ticket_status_summary(request):
    """GET /api/analytics/tickets/status-summary/
    Returns ticket counts grouped by status_code.
    """
    if request.user.role != 'shop_owner':
        return Response({'detail': 'Forbidden.'}, status=403)

    data = (
        RepairOrder.objects
        .filter(_owner_filter(request))
        .annotate(status_code=F('status__code'))
        .values('status_code')
        .annotate(count=Count('id'))
        .order_by('status_code')
    )
    return Response({'data': list(data)})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def technician_performance(request):
    """GET /api/analytics/technicians/performance/
    Returns per-technician closed ticket counts + avg repair time.
    """
    if request.user.role != 'shop_owner':
        return Response({'detail': 'Forbidden.'}, status=403)

    techs = Technician.objects.filter(
        Q(shop__user=request.user) | Q(branch__organization__owner__user=request.user)
    ).distinct()

    results = []
    for tech in techs:
        closed = RepairOrder.objects.annotate(status_code=F('status__code')).filter(
            assigned_technician=tech,
            status_code__in=['ready', 'delivered'],
        )
        results.append({
            'technician_id': tech.id,
            'username': tech.user.username if tech.user else 'N/A',
            'display_name': tech.user.get_full_name() or tech.user.username if tech.user else 'N/A',
            'closed_tickets': closed.count(),
            'is_verified': tech.is_verified,
        })

    results.sort(key=lambda x: x['closed_tickets'], reverse=True)
    return Response({'data': results})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def low_stock_summary(request):
    """GET /api/analytics/inventory/low-stock/
    Returns inventory items where stock_level <= low_stock_threshold.
    """
    if request.user.role not in ('shop_owner', 'technician'):
        return Response({'detail': 'Forbidden.'}, status=403)

    if request.user.role == 'shop_owner':
        items = InventoryItem.objects.filter(
            branch__organization__owner__user=request.user,
        )
    else:
        from providers.models import Technician as Tech
        tech = Tech.objects.filter(user=request.user).first()
        if tech and tech.branch:
            items = InventoryItem.objects.filter(branch=tech.branch)
        else:
            items = InventoryItem.objects.none()

    low_stock = items.filter(stock_level__lte=F('low_stock_threshold'))

    return Response({
        'count': low_stock.count(),
        'items': [
            {
                'id': i.id,
                'name': i.name,
                'sku': i.sku,
                'branch': i.branch.name,
                'stock_level': i.stock_level,
                'low_stock_threshold': i.low_stock_threshold,
            }
            for i in low_stock
        ],
    })


def models_low_threshold():
    """Placeholder — actual filtering uses F() expression above."""
    return 0


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_kpis(request):
    """GET /api/analytics/kpis/
    Returns high-level KPIs for the shop owner's dashboard.
    """
    if request.user.role != 'shop_owner':
        return Response({'detail': 'Forbidden.'}, status=403)

    q = _owner_filter(request)
    tickets = RepairOrder.objects.filter(q).annotate(status_code=F('status__code'))
    since_30d = timezone.now() - timedelta(days=30)

    total_revenue = GSTInvoice.objects.filter(
        ticket__branch__organization__owner__user=request.user,
        payment_status='paid',
    ).aggregate(total=Sum('grand_total'))['total'] or 0

    return Response({
        'total_tickets': tickets.count(),
        'open_tickets': tickets.exclude(status_code__in=['delivered', 'cancelled']).count(),
        'closed_this_month': tickets.filter(
            status_code__in=['ready', 'delivered'],
            updated_at__gte=since_30d,
        ).count(),
        'total_revenue_paid': float(total_revenue),
        'low_stock_count': InventoryItem.objects.filter(
            branch__organization__owner__user=request.user,
        ).filter(stock_level__lte=F('low_stock_threshold')).count(),
    })
