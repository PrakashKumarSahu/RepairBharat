from django.urls import path
from .views import WorkflowStageListCreateView

urlpatterns = [
    path("stages/", WorkflowStageListCreateView.as_view(), name="stage-list-create"),
]
