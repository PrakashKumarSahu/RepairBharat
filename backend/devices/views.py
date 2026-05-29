from rest_framework import generics, permissions
from .models import Device
from .serializers import DeviceSerializer
from accounts.models import CustomUser


class DeviceListCreateView(generics.ListCreateAPIView):
    serializer_class = DeviceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "customer":
            return Device.objects.filter(customer=user).order_by("-created_at")
        return Device.objects.all().order_by("-created_at")

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == "customer":
            serializer.save(customer=user)
        else:
            cust_id = self.request.data.get("customer")
            if cust_id:
                try:
                    cust_user = CustomUser.objects.get(id=cust_id)
                    serializer.save(customer=cust_user)
                except CustomUser.DoesNotExist:
                    serializer.save(customer=user)
            else:
                serializer.save(customer=user)
