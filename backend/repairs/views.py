from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import RepairOrder
from .serializers import RepairOrderSerializer
from accounts.models import CustomUser
from devices.models import Device
from workflow.models import WorkflowStage
from providers.models import Technician


class RepairOrderListCreateView(generics.ListCreateAPIView):
    serializer_class = RepairOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "customer":
            return RepairOrder.objects.filter(customer=user).order_by("-created_at")
        elif user.role == "technician":
            tech = Technician.objects.filter(user=user).first()
            return RepairOrder.objects.filter(assigned_technician=tech).order_by("-created_at")
        elif user.role == "shop_owner":
            return RepairOrder.objects.filter(branch__organization__owner__user=user).order_by("-created_at")
        return RepairOrder.objects.none()

    def create(self, request, *args, **kwargs):
        user = request.user
        customer_user = user

        if user.role == "shop_owner" or user.role == "technician":
            cust_id = request.data.get("customer")
            if cust_id:
                try:
                    customer_user = CustomUser.objects.get(id=cust_id)
                except CustomUser.DoesNotExist:
                    pass

        # 1. Device resolving: either via ID or inline parameters
        device_id = request.data.get("device")
        device_obj = None

        if device_id:
            try:
                device_obj = Device.objects.get(id=device_id)
            except Device.DoesNotExist:
                pass

        if not device_obj:
            brand = request.data.get("device_brand", "Generic")
            model = request.data.get("device_model", "Unknown")
            category = request.data.get("device_category", "Smartphone")
            serial = request.data.get("device_serial", "")
            
            # Auto create device log
            device_obj = Device.objects.create(
                customer=customer_user,
                brand=brand,
                model=model,
                category=category,
                serial_number_or_imei=serial
            )

        # 2. Status resolving (default to received)
        status_id = request.data.get("status")
        status_obj = None
        if status_id:
            try:
                status_obj = WorkflowStage.objects.get(id=status_id)
            except (WorkflowStage.DoesNotExist, ValueError):
                pass
        
        if not status_obj:
            status_obj, _ = WorkflowStage.objects.get_or_create(
                code="received",
                defaults={"name": "Received", "order": 1, "color_hex": "#7c6cff"}
            )

        # 3. Technician resolving
        tech_id = request.data.get("assigned_technician")
        tech_obj = None
        if tech_id:
            try:
                tech_obj = Technician.objects.get(id=tech_id)
            except (Technician.DoesNotExist, ValueError):
                pass

        branch_id = request.data.get("branch")
        issue = request.data.get("issue_reported", "System diagnosis request")
        diag = request.data.get("diagnostics_notes", "")
        priority = request.data.get("priority", "medium")
        cost = request.data.get("estimated_cost", "0.00")
        advance = request.data.get("advance_paid", "0.00")

        order = RepairOrder.objects.create(
            branch_id=branch_id,
            customer=customer_user,
            device=device_obj,
            assigned_technician=tech_obj,
            issue_reported=issue,
            diagnostics_notes=diag,
            status=status_obj,
            priority=priority,
            estimated_cost=cost,
            advance_paid=advance
        )

        # Log initial stage
        from .models import RepairOrderHistory
        RepairOrderHistory.objects.create(
            repair_order=order,
            stage=status_obj,
            notes=issue or "Repair ticket initialized.",
            updated_by=user
        )

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RepairOrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = RepairOrder.objects.all()
    serializer_class = RepairOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        old_status = self.get_object().status
        
        status_code = self.request.data.get("status_code")
        if status_code:
            from workflow.models import WorkflowStage
            status_obj = WorkflowStage.objects.filter(code=status_code).first()
            if status_obj:
                serializer.validated_data["status"] = status_obj

        instance = serializer.save()
        new_status = instance.status

        stage_notes = self.request.data.get("stage_notes", "")
        # Create history log if status changed or notes are explicitly sent
        if old_status != new_status or stage_notes:
            from .models import RepairOrderHistory
            RepairOrderHistory.objects.create(
                repair_order=instance,
                stage=new_status,
                notes=stage_notes or f"Repair migrated to {new_status.name}",
                updated_by=self.request.user
            )
