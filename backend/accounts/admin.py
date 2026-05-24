from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import UserProfile


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    extra = 0


class RoleListFilter(admin.SimpleListFilter):
    title = 'role'
    parameter_name = 'role'

    def lookups(self, request, model_admin):
        return UserProfile.ROLE_CHOICES

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(profile__role=self.value())
        return queryset


User = get_user_model()

try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    inlines = (UserProfileInline,)
    list_filter = DjangoUserAdmin.list_filter + (RoleListFilter,)
    list_select_related = ('profile',)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'updated_at')
    list_filter = ('role',)
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'user__email')
