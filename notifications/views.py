from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).select_related("actor", "post")
    
    @action(detail=True, methods=["patch"])
    def read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()

        return Response({"status": "Уведомление отмечено как прочитанное"})

    @action(detail=False, methods=["patch"])
    def read_all(self, request):
        self.get_queryset().update(is_read=True)

        return Response({"status": "Все уведомления помеченны как прочитанные"})