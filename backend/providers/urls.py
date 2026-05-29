from django.urls import path
from .views import (
    SkillListCreateView,
    TechnicianListCreateView,
    ShopOwnerLookupView,
    JoinRequestListCreateUpdateView,
    TechnicianDetailView
)

urlpatterns = [
    path("skills/", SkillListCreateView.as_view(), name="skill-list-create"),
    path("technicians/", TechnicianListCreateView.as_view(), name="tech-list-create"),
    path("technicians/<int:pk>/", TechnicianDetailView.as_view(), name="tech-detail"),
    path("shops/", ShopOwnerLookupView.as_view(), name="shop-lookup"),
    path("join-requests/", JoinRequestListCreateUpdateView.as_view(), name="join-requests"),
    path("join-requests/<int:pk>/", JoinRequestListCreateUpdateView.as_view(), name="join-request-detail"),
]
