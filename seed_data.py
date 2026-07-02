from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from apps.projects.models import Project, ProjectMember
from apps.tasks.models import Task

User = get_user_model()
project = Project.objects.get(pk=1)

usuarios_nuevos = []
for i in range(1, 4):
    user, created = User.objects.get_or_create(
        username=f"tester{i}",
        defaults={"email": f"tester{i}@test.com"},
    )
    if created:
        user.set_password("TestPass123")
        user.save()
    ProjectMember.objects.get_or_create(
        project=project, user=user, defaults={"role": "member"}
    )
    usuarios_nuevos.append(user)

print("Usuarios listos:", [u.username for u in usuarios_nuevos])

conteos = {usuarios_nuevos[0]: 5, usuarios_nuevos[1]: 3, usuarios_nuevos[2]: 2}

for user, cantidad in conteos.items():
    for i in range(cantidad):
        dias_atras = 10 - i
        horas_para_completar = 4 + (i * 3)

        task = Task.objects.create(
            project=project,
            created_by=user,
            assignee=user,
            title=f"Tarea {user.username} #{i+1}",
            status="done",
        )
        fecha_creacion = timezone.now() - timedelta(days=dias_atras)
        fecha_completada = fecha_creacion + timedelta(hours=horas_para_completar)
        Task.objects.filter(pk=task.pk).update(
            created_at=fecha_creacion,
            completed_at=fecha_completada,
        )

print("Tareas de prueba creadas.")