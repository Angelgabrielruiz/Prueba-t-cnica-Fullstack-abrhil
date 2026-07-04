from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions

from .models import Activity
from .serializers import ActivitySerializer


class ActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Solo lectura: el historial de actividad se genera exclusivamente
    vía signals (ver apps/activity/signals.py), nunca por escritura directa del cliente.
    """
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        "project": ["exact"],
        "action": ["exact"],
        "user": ["exact"],
        "task": ["exact"],
        "created_at": ["gte", "lte"],
    }

    def get_queryset(self):
        return (
            Activity.objects.filter(project__members__user=self.request.user)
            .distinct()
            .select_related("project", "task", "user")
        )
