from rest_framework.permissions import SAFE_METHODS, BasePermission

from users.models import User

class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if isinstance(obj, User):
            return obj == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False