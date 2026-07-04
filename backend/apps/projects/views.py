from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.projects.models import ProjectMember, Project
from apps.projects.permissions import IsProjectMember
from apps.projects.serializers import (
    ProjectMemberSerializer,
    ProjectSerializer,
    ProjectWriteSerializer,
)

User = get_user_model()


class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]
    filterset_fields = ["status"]

    def get_queryset(self):
        return (
            Project.objects.filter(members__user=self.request.user)
            .distinct()
            .select_related("created_by")
            .prefetch_related("members__user")
        )

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ProjectWriteSerializer
        return ProjectSerializer

    def create(self, request, *args, **kwargs):
        write_serializer = self.get_serializer(data=request.data)
        write_serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            project = write_serializer.save(created_by=request.user)
            ProjectMember.objects.create(
                project=project, user=request.user, role="admin"
            )

        read_serializer = ProjectSerializer(project, context=self.get_serializer_context())
        return Response(read_serializer.data, status=201)

    @action(detail=True, methods=["post"], url_path="members")
    def add_member(self, request, pk=None):
        # get_object() ya aplica IsProjectMember.has_object_permission: un método no
        # seguro (POST) sobre este Project exige que el request.user sea admin del
        # proyecto, así que no hace falta repetir esa validación aquí.
        project = self.get_object()

        email = (request.data.get("email") or "").strip().lower()
        role = request.data.get("role", "member")

        if role not in dict(ProjectMember.ROLE_CHOICES):
            return Response({"role": "Rol inválido."}, status=400)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response(
                {"email": "No existe ningún usuario registrado con ese correo."},
                status=400,
            )

        if ProjectMember.objects.filter(project=project, user=user).exists():
            return Response(
                {"email": "Ese usuario ya es miembro del proyecto."}, status=400
            )

        member = ProjectMember.objects.create(project=project, user=user, role=role)
        return Response(ProjectMemberSerializer(member).data, status=201)

    @action(
        detail=True,
        methods=["delete"],
        url_path=r"members/(?P<user_id>[^/.]+)",
    )
    def remove_member(self, request, pk=None, user_id=None):
        project = self.get_object()

        membership = ProjectMember.objects.filter(
            project=project, user_id=user_id
        ).first()
        if membership is None:
            return Response(status=404)

        if membership.role == "admin":
            other_admins = (
                ProjectMember.objects.filter(project=project, role="admin")
                .exclude(pk=membership.pk)
                .exists()
            )
            if not other_admins:
                return Response(
                    {"detail": "No puedes eliminar al único admin del proyecto."},
                    status=400,
                )

        membership.delete()
        return Response(status=204)