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
        )

    def validate_role(self, value):

        valid_roles = [role[0] for role in CustomUser.Roles.choices]

        if value not in valid_roles:
            raise serializers.ValidationError("Invalid role")

        return value

    def create(self, validated_data):

        password = validated_data.pop("password")

        user = CustomUser(**validated_data)

        user.set_password(password)

        user.save()

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