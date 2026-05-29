from rest_framework import generics, permissions
from django.db.models import Q
from .models import Organization, Branch
from .serializers import OrganizationSerializer, BranchSerializer
from accounts.models import ShopOwnerProfile


class OrganizationListCreateView(generics.ListCreateAPIView):
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "shop_owner":
            return Organization.objects.filter(owner__user=user)
        return Organization.objects.none()

    def perform_create(self, serializer):
        profile = self.request.user.shop_owner_profile
        serializer.save(owner=profile)


class BranchListCreateView(generics.ListCreateAPIView):
    serializer_class = BranchSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        queryset = Branch.objects.all().order_by("-rating")
        
        # Restrict branches for franchise management, unless B2C customer portal requests all
        if user.is_authenticated and self.request.query_params.get("all") != "true":
            if user.role == "shop_owner":
                queryset = queryset.filter(organization__owner__user=user)
            elif user.role == "technician":
                tech_profile = getattr(user, "technician_profile_new", None)
                if tech_profile and tech_profile.shop:
                    queryset = queryset.filter(organization__owner=tech_profile.shop)

        city = self.request.query_params.get("city", None)
        specialty = self.request.query_params.get("specialty", None)
        search = self.request.query_params.get("search", None)

        if city:
            queryset = queryset.filter(city__iexact=city)
        if specialty:
            queryset = queryset.filter(specialties__icontains=specialty)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(address__icontains=search) |
                Q(specialties__icontains=search)
            )
        return queryset

    def perform_create(self, serializer):
        profile = self.request.user.shop_owner_profile
        org = Organization.objects.filter(owner=profile).first()
        if not org:
            org = Organization.objects.create(owner=profile, name=f"{profile.shop_name} HQ")
        serializer.save(organization=org)
