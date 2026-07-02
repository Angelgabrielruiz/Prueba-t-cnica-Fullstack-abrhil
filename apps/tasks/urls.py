from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, dashboard_view

router = DefaultRouter()
router.register("tasks", TaskViewSet, basename="task")

urlpatterns = router.urls + [
    path("dashboard/", dashboard_view, name="dashboard"),
]