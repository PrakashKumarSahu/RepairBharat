from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CustomUser

from .serializers import (
    RegisterSerializer,
    UserSerializer,
    ChangePasswordSerializer
)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()

        # Auto-bootstrap Organization + Branch for new shop owners
        if user.role == 'shop_owner':
            from organizations.models import Organization, Branch
            from accounts.models import ShopOwnerProfile
            shop_profile, _ = ShopOwnerProfile.objects.get_or_create(
                user=user,
                defaults={
                    'shop_name': f"{user.username}'s Shop",
                    'shop_address': 'Update your address',
                }
            )
            if not Organization.objects.filter(owner=shop_profile).exists():
                org = Organization.objects.create(
                    owner=shop_profile,
                    name=f"{user.username}'s Shop",
                    gst_number='',
                )
                Branch.objects.create(
                    organization=org,
                    name=f"{user.username}'s Shop",
                    city='Mumbai',
                    address='Update your address in settings',
                    phone=user.phone or '',
                    specialties='Mobiles, Laptops, Electronics',
                    latitude=19.0760,
                    longitude=72.8777,
                )

        # Ensure providers.Technician record exists for technicians
        if user.role == 'technician':
            from providers.models import Technician
            Technician.objects.get_or_create(user=user)


class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        old_password = serializer.validated_data["old_password"]
        new_password = serializer.validated_data["new_password"]

        if not user.check_password(old_password):
            return Response(
                {"detail": "Old password is incorrect"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()
        return Response(
            {"detail": "Password changed successfully"},
            status=status.HTTP_200_OK
        )


class CustomerListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ["shop_owner", "technician"]:
            return CustomUser.objects.filter(role="customer").order_by("username")
        return CustomUser.objects.none()