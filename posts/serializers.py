from rest_framework import serializers
from users.serializers import UserSerializer
from .models import Comment, Like, Post


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'author', 'post', 'text', 'created_at', 'likes_count', 'is_liked']
        read_only_fields = ("author",)  

    def get_likes_count(self, obj):
        return Like.objects.filter(comment=obj).count()

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, comment=obj).exists()
        return False


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()

    score = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'media', 'created_at', 'updated_at', 'author', 'comments', 'is_liked', 'likes_count', 'comments_count', 'rating_avg', 'rating_count', 'score']
        read_only_fields = ("author",)
    
    def get_likes_count(self, obj):
        return obj.likes.count()
        
    def get_is_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False
        
    def get_comments_count(self, obj):
        return obj.comments.count()

class PostRatingSerializer(serializers.Serializer):
    value = serializers.IntegerField(min_value=1, max_value=5)
    

class LikeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Like
        fields = ['user', 'post']