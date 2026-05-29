from rest_framework import generics, permissions
from .models import InventoryItem
from .serializers import InventoryItemSerializer


class InventoryItemListCreateView(generics.ListCreateAPIView):
    serializer_class = InventoryItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        branch_id = self.request.query_params.get("branch", None)
        queryset = InventoryItem.objects.all()

        if user.role == "shop_owner":
            queryset = queryset.filter(branch__organization__owner__user=user)
        elif user.role == "technician":
            # Technician can view spares
            tech_profile = getattr(user, "technician_profile_new", None)
            if tech_profile and tech_profile.shop:
                queryset = queryset.filter(branch__organization__owner=tech_profile.shop)

        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)

        return queryset.order_by("name")


class InventoryItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [permissions.IsAuthenticated]
