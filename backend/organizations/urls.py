from django.urls import path
from .views import OrganizationListCreateView, BranchListCreateView

urlpatterns = [
    path("", OrganizationListCreateView.as_view(), name="org-list-create"),
    path("branches/", BranchListCreateView.as_view(), name="branch-list-create"),
]
