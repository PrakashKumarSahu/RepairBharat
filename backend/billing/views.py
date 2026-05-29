from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import GSTInvoice
from .serializers import GSTInvoiceSerializer
from repairs.models import RepairOrder
from workflow.models import WorkflowStage
from inventory.models import InventoryItem
from decimal import Decimal


class GSTInvoiceListCreateView(generics.ListCreateAPIView):
    serializer_class = GSTInvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = GSTInvoice.objects.all()
        if user.role == "customer":
            queryset = queryset.filter(ticket__customer=user)
        elif user.role == "shop_owner":
            queryset = queryset.filter(ticket__branch__organization__owner__user=user)
        elif user.role == "technician":
            tech_profile = getattr(user, "technician_profile_new", None)
            queryset = queryset.filter(ticket__assigned_technician=tech_profile)
        return queryset.order_by("-created_at")

    def create(self, request, *args, **kwargs):
        ticket_id = request.data.get("ticket")
        labor_charges = Decimal(request.data.get("labor_charges", "0.00"))
        labor_gst_rate = Decimal(request.data.get("labor_gst_rate", "18.00"))
        payment_method = request.data.get("payment_method", "upi")
        payment_status = request.data.get("payment_status", "unpaid")
        
        # New GST Compliant Fields
        shop_gstin = request.data.get("shop_gstin", "27AAAAA1111A1Z1")
        customer_gstin = request.data.get("customer_gstin", "")
        billing_address = request.data.get("billing_address", "")

        spares_used = request.data.get("spares_used", [])

        try:
            ticket = RepairOrder.objects.get(id=ticket_id)
        except RepairOrder.DoesNotExist:
            return Response({"detail": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)

        if GSTInvoice.objects.filter(ticket=ticket).exists():
            return Response({"detail": "Invoice already exists for this ticket"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Spares cost calculation + stock deduction
        spares_total = Decimal("0.00")
        spares_gst = Decimal("0.00")

        for s in spares_used:
            try:
                item = InventoryItem.objects.get(id=s["id"])
                qty = int(s["quantity"])
                if item.stock_level >= qty:
                    item.stock_level -= qty
                    item.save()
                    
                    cost = item.selling_price * qty
                    gst_part = cost * (item.gst_rate / Decimal("100.00"))
                    spares_total += cost
                    spares_gst += gst_part
                else:
                    return Response({"detail": f"Insufficient stock for {item.name}"}, status=status.HTTP_400_BAD_REQUEST)
            except InventoryItem.DoesNotExist:
                pass

        # 2. Labor tax calculation
        labor_gst = labor_charges * (labor_gst_rate / Decimal("100.00"))

        # 3. Total values (CGST & SGST CGST+SGST split equally)
        total_gst = labor_gst + spares_gst
        cgst = total_gst / Decimal("2.00")
        sgst = total_gst / Decimal("2.00")
        igst = Decimal("0.00")

        grand_total = labor_charges + spares_total + total_gst

        invoice = GSTInvoice.objects.create(
            ticket=ticket,
            labor_charges=labor_charges,
            labor_gst_rate=labor_gst_rate,
            cgst=cgst,
            sgst=sgst,
            igst=igst,
            grand_total=grand_total,
            payment_status=payment_status,
            payment_method=payment_method,
            shop_gstin=shop_gstin,
            customer_gstin=customer_gstin,
            billing_address=billing_address
        )

        # Invoice Ninja integration disabled per user request
        pass

        # Update repair ticket status to delivered/ready using WorkflowStage lookup
        target_code = "delivered" if payment_status == "paid" else "ready"
        stage_obj = WorkflowStage.objects.filter(code=target_code).first()
        if stage_obj:
            ticket.status = stage_obj
        ticket.estimated_cost = grand_total
        ticket.save()

        serializer = self.get_serializer(invoice)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class GSTInvoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = GSTInvoice.objects.all()
    serializer_class = GSTInvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]
