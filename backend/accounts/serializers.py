from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import (
    CustomUser,
    CustomerProfile,
    TechnicianProfile,
    ShopOwnerProfile
)


class CustomerProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomerProfile
        exclude = ["id"]


class TechnicianProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = TechnicianProfile
        exclude = ["id"]


class ShopOwnerProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = ShopOwnerProfile
        exclude = ["id"]


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    shop_to_which_he_belong = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )

    class Meta:
        model = CustomUser
        fields = (
            "id",
            "username",
            "email",
            "password",
            "phone",
            "address",
            "role",
            "shop_to_which_he_belong",
        )

    def validate_role(self, value):

        valid_roles = [role[0] for role in CustomUser.Roles.choices]

        if value not in valid_roles:
            raise serializers.ValidationError("Invalid role")

        return value

    def create(self, validated_data):
        shop_name = validated_data.pop("shop_to_which_he_belong", None)
        password = validated_data.pop("password")

        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()

        # If user is a technician and specified a shop, associate them
        if user.role == CustomUser.Roles.TECHNICIAN and shop_name:
            try:
                from .models import ShopOwnerProfile
                # Search by shop name or owner username
                shop = ShopOwnerProfile.objects.filter(
                    models.Q(shop_name__icontains=shop_name) | 
                    models.Q(user__username__iexact=shop_name)
                ).first()
                if shop:
                    profile = user.technician_profile
                    profile.shop = shop
                    profile.save()

                    # Also link the new high-fidelity technician profile
                    from providers.models import Technician as NewTechnician
                    new_tech = NewTechnician.objects.filter(user=user).first()
                    if new_tech:
                        new_tech.shop = shop
                        # Also default assign them to the first branch of the organization
                        from organizations.models import Branch
                        branch = Branch.objects.filter(organization__owner=shop).first()
                        if branch:
                            new_tech.branch = branch
                        new_tech.save()
            except Exception:
                pass

        return user


class UserSerializer(serializers.ModelSerializer):

    customer_profile = CustomerProfileSerializer(read_only=True)

    technician_profile = TechnicianProfileSerializer(read_only=True)

    shop_owner_profile = ShopOwnerProfileSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = (
            "id",
            "username",
            "email",
            "phone",
            "address",
            "role",
            "customer_profile",
            "technician_profile",
            "shop_owner_profile",
        )


class ChangePasswordSerializer(serializers.Serializer):

    old_password = serializers.CharField(required=True)

    new_password = serializers.CharField(
        required=True,
        validators=[validate_password]
    )