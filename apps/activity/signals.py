from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from apps.tasks.models import Task
from apps.comments.models import Comment
from apps.activity.models import Activity


@receiver(pre_save, sender=Task)
def capture_old_status(sender, instance, **kwargs):
    if instance.pk is None:
        # Es una tarea nueva, todavía no existe en BD, no hay "status anterior" que comparar
        instance._old_status = None
        return

    try:
        old_instance = Task.objects.get(pk=instance.pk)
        instance._old_status = old_instance.status
    except Task.DoesNotExist:
        instance._old_status = None


@receiver(post_save, sender=Task)
def log_task_activity(sender, instance, created, **kwargs):
    if created:
        Activity.objects.create(
            project=instance.project,
            task=instance,
            user=instance.created_by,
            action="task_created",
            metadata={"title": instance.title},
        )
        return

    old_status = getattr(instance, "_old_status", None)
    if old_status is not None and old_status != instance.status:
        Activity.objects.create(
            project=instance.project,
            task=instance,
            user=instance.assignee or instance.created_by,
            action="task_status_changed",
            metadata={"old_status": old_status, "new_status": instance.status},
        )


@receiver(post_save, sender=Comment)
def log_comment_activity(sender, instance, created, **kwargs):
    if created:
        Activity.objects.create(
            project=instance.task.project,
            task=instance.task,
            user=instance.user,
            action="comment_added",
            metadata={"comment_id": instance.id},
        )