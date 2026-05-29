from django.urls import path
from rest_framework_simplejwt.views import (TokenRefreshView,)

from .views import (RegisterView,ChangePasswordView,ProfileView, CustomerListView)
from rest_framework_simplejwt.views import TokenObtainPairView


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("customers/", CustomerListView.as_view(), name="customer_list"),
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),
]