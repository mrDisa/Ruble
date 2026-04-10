from rest_framework import serializers
from users.serializers import UserSerializer
from .models import Comment, Like, Post


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    class Meta:
        model = Comment
        fields = ("__all__")
        read_only_fields = ("author", "post",)  

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'media', 'created_at', 'updated_at', 'author', 'comments']
        read_only_fields = ("author",)

class LikeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Like
        fields = ['user', 'post']