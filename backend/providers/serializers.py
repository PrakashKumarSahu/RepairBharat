from rest_framework import serializers
from .models import Skill, Technician


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = "__all__"


class TechnicianSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    skills_list = SkillSerializer(source="skills", many=True, read_only=True)
    branch_name = serializers.CharField(source="branch.name", read_only=True)

    class Meta:
        model = Technician
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


from accounts.models import ShopOwnerProfile
from .models import TechnicianJoinRequest

class ShopOwnerDetailSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)

    class Meta:
        model = ShopOwnerProfile
        fields = ("id", "shop_name", "shop_address", "gst_number", "owner_username", "email", "phone")


class TechnicianJoinRequestSerializer(serializers.ModelSerializer):
    technician_name = serializers.CharField(source="technician.user.username", read_only=True)
    shop_name = serializers.CharField(source="shop.shop_name", read_only=True)
    owner_username = serializers.CharField(source="shop.user.username", read_only=True)
    skills_summary = serializers.SerializerMethodField()
    experience_years = serializers.IntegerField(source="technician.experience_years", read_only=True)

    class Meta:
        model = TechnicianJoinRequest
        fields = (
            "id",
            "technician",
            "technician_name",
            "shop",
            "shop_name",
            "owner_username",
            "status",
            "skills_summary",
            "experience_years",
            "created_at",
            "updated_at"
        )
        read_only_fields = ("id", "technician", "created_at", "updated_at")

    def get_skills_summary(self, obj):
        return [sk.name for sk in obj.technician.skills.all()]
