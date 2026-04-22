from rest_framework import serializers

from notifications.models import Notification
from users.serializers import UserSerializer

class NotificationSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    class Meta:
        model = Notification
        fields = ("__all__")
        read_only_fields = ("author", "created_at", "is_read")