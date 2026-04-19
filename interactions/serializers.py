from rest_framework import serializers

from users.serializers import UserSerializer

from .models import Follow
        
class FollowSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    class Meta:
        model = Follow
        fields = ['follower', 'following', 'created_at']