from rest_framework import generics, permissions
from .models import Skill, Technician
from .serializers import SkillSerializer, TechnicianSerializer


class SkillListCreateView(generics.ListCreateAPIView):
    queryset = Skill.objects.all().order_by("name")
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class TechnicianListCreateView(generics.ListCreateAPIView):
    serializer_class = TechnicianSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Technician.objects.all()
        if user.role == "shop_owner":
            shop_profile = getattr(user, "shop_owner_profile", None)
            if shop_profile:
                from django.db.models import Q
                from .models import TechnicianJoinRequest
                join_tech_ids = TechnicianJoinRequest.objects.filter(
                    shop=shop_profile
                ).values_list("technician_id", flat=True)
                queryset = queryset.filter(
                    Q(shop=shop_profile) | Q(shop__isnull=True) | Q(id__in=join_tech_ids)
                )
        return queryset.order_by("-is_verified")


from accounts.models import ShopOwnerProfile
from .models import TechnicianJoinRequest
from .serializers import ShopOwnerDetailSerializer, TechnicianJoinRequestSerializer
from rest_framework.response import Response
from rest_framework import status

class ShopOwnerLookupView(generics.ListAPIView):
    serializer_class = ShopOwnerDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = ShopOwnerProfile.objects.all()
        search_query = self.request.query_params.get("search", None)
        if search_query:
            from django.db.models import Q
            # Check ID match or shop name or username
            q_filter = Q(shop_name__icontains=search_query) | Q(user__username__icontains=search_query)
            try:
                # If numeric, also match ID
                q_filter |= Q(id=int(search_query))
            except ValueError:
                pass
            queryset = queryset.filter(q_filter)
        return queryset.order_by("shop_name")


class JoinRequestListCreateUpdateView(generics.ListCreateAPIView, generics.UpdateAPIView):
    serializer_class = TechnicianJoinRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "technician":
            return TechnicianJoinRequest.objects.filter(technician__user=user).order_by("-created_at")
        elif user.role == "shop_owner":
            shop_profile = getattr(user, "shop_owner_profile", None)
            if shop_profile:
                return TechnicianJoinRequest.objects.filter(shop=shop_profile).order_by("-created_at")
        return TechnicianJoinRequest.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != "technician":
            raise Response({"detail": "Only technicians can create join requests."}, status=status.HTTP_400_BAD_REQUEST)
        tech = Technician.objects.get(user=user)
        shop_id = self.request.data.get("shop")
        shop = ShopOwnerProfile.objects.get(id=shop_id)
        serializer.save(technician=tech, shop=shop, status="pending")

    def patch(self, request, *args, **kwargs):
        request_id = request.data.get("request_id") or kwargs.get("pk")
        if not request_id:
            return Response({"detail": "request_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            join_request = TechnicianJoinRequest.objects.get(id=request_id)
        except TechnicianJoinRequest.DoesNotExist:
            return Response({"detail": "Join request not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if user.role != "shop_owner" or join_request.shop.user != user:
            return Response({"detail": "Not authorized to modify this join request."}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get("status")
        if new_status not in ["approved", "rejected"]:
            return Response({"detail": "Invalid status value."}, status=status.HTTP_400_BAD_REQUEST)

        join_request.status = new_status
        join_request.save()

        if new_status == "approved":
            # 1. Update high-fidelity Technician profile
            tech = join_request.technician
            tech.shop = join_request.shop
            tech.is_verified = True
            
            # Auto-assign to the first branch of the organization if available
            from organizations.models import Branch
            branch = Branch.objects.filter(organization__owner=join_request.shop).first()
            if branch:
                tech.branch = branch
            tech.save()

            # 2. Update legacy profile in accounts app as well
            try:
                legacy_profile = getattr(tech.user, "technician_profile", None)
                if legacy_profile:
                    legacy_profile.shop = join_request.shop
                    legacy_profile.is_verified = True
                    legacy_profile.save()
            except Exception:
                pass

        serializer = self.get_serializer(join_request)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TechnicianDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Technician.objects.all()
    serializer_class = TechnicianSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        instance = serializer.save()
        try:
            from accounts.models import TechnicianProfile
            legacy_profile = getattr(instance.user, "technician_profile", None)
            if legacy_profile:
                legacy_profile.is_verified = instance.is_verified
                legacy_profile.shop = instance.shop
                legacy_profile.save()
        except Exception:
            pass
