from rest_framework import permissions


class IsShopOwner(permissions.BasePermission):
    """Allow access only to users with the 'shop_owner' role."""
    message = "Only shop owners can perform this action."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "shop_owner"


class IsTechnician(permissions.BasePermission):
    """Allow access only to users with the 'technician' role."""
    message = "Only technicians can perform this action."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "technician"


class IsCustomer(permissions.BasePermission):
    """Allow access only to users with the 'customer' role."""
    message = "Only customers can perform this action."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "customer"


class IsShopOwnerOrTechnician(permissions.BasePermission):
    """Allow access only to shop owners or technicians."""
    message = "Only shop owners or technicians can perform this action."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in ["shop_owner", "technician"]
        )


class IsOwnerOfInvoice(permissions.BasePermission):
    """Object-level: allow safe methods to all authenticated users,
    but restrict writes to the shop owner who owns the invoice's branch."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            user = request.user
            # Customers may only read their own invoices
            if user.role == "customer":
                return obj.ticket and obj.ticket.customer == user
            # Shop owners may read invoices belonging to their orgs
            if user.role == "shop_owner":
                return (
                    obj.ticket
                    and obj.ticket.branch.organization.owner.user == user
                )
            # Technicians assigned to the ticket may read
            if user.role == "technician":
                tech_profile = getattr(user, "technician_profile_new", None)
                return (
                    tech_profile
                    and obj.ticket
                    and obj.ticket.assigned_technician == tech_profile
                )
            return False
        # Write operations (PUT, PATCH, DELETE) — shop owner only
        user = request.user
        if user.role != "shop_owner":
            return False
        return (
            obj.ticket
            and obj.ticket.branch.organization.owner.user == user
        )


class IsOwnerOfRepairOrder(permissions.BasePermission):
    """Object-level: allow writes on repair orders only to the branch's shop owner."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        if request.method in permissions.SAFE_METHODS:
            if user.role == "customer":
                return obj.customer == user
            if user.role == "shop_owner":
                return obj.branch.organization.owner.user == user
            if user.role == "technician":
                tech_profile = getattr(user, "technician_profile_new", None)
                if not tech_profile:
                    return False
                from django.db.models import Q
                return (
                    obj.assigned_technician == tech_profile
                    or (tech_profile.branch and obj.branch == tech_profile.branch)
                    or (tech_profile.shop and obj.branch.organization.owner == tech_profile.shop)
                )
            return False
        # Writes — shop owners and their assigned technicians
        if user.role == "shop_owner":
            return obj.branch.organization.owner.user == user
        if user.role == "technician":
            tech_profile = getattr(user, "technician_profile_new", None)
            if not tech_profile:
                return False
            return (
                obj.assigned_technician == tech_profile
                or (tech_profile.branch and obj.branch == tech_profile.branch)
                or (tech_profile.shop and obj.branch.organization.owner == tech_profile.shop)
            )
        return False


class IsOwnerOfInventoryItem(permissions.BasePermission):
    """Object-level: only the branch's shop owner can modify inventory items."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        if request.method in permissions.SAFE_METHODS:
            if user.role == "shop_owner":
                return obj.branch.organization.owner.user == user
            if user.role == "technician":
                tech_profile = getattr(user, "technician_profile_new", None)
                return tech_profile and tech_profile.shop == obj.branch.organization.owner
            return False
        # Writes — shop owner only
        if user.role != "shop_owner":
            return False
        return obj.branch.organization.owner.user == user


class IsOwnerOfTechnicianRecord(permissions.BasePermission):
    """Object-level: allow technician to update own record, or shop owner to update their technicians."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == "technician":
            return obj.user == user
        if user.role == "shop_owner":
            shop_profile = getattr(user, "shop_owner_profile", None)
            return shop_profile and obj.shop == shop_profile
        return False
