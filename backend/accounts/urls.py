from django.urls import path
from .views import (
    LoginView,
    RegisterView,
    LogoutView,
    PasswordResetView,
    PasswordResetConfirmView,
    ChangePasswordView,
)

urlpatterns = [
    path('login/', LoginView.as_view(), name='token_obtain_pair'),
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('password-reset/', PasswordResetView.as_view(), name='password_reset'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
]
