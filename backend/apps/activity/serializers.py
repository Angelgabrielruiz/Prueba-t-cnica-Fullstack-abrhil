from rest_framework import serializers

from apps.users.serializers import UserSummarySerializer
from .models import Activity


class ActivitySerializer(serializers.ModelSerializer):
    user = UserSummarySerializer(read_only=True)
    action_display = serializers.CharField(source="get_action_display", read_only=True)
    task_title = serializers.CharField(source="task.title", read_only=True, default=None)

    class Meta:
        model = Activity
        fields = [
            "id", "project", "task", "task_title", "user",
            "action", "action_display", "metadata", "created_at",
        ]
        read_only_fields = fields
