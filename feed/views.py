from django.shortcuts import render
from rest_framework import generics

from main.models import Follow
from posts.models import Post
from posts.serializers import PostSerializer
from rest_framework.permissions import IsAuthenticated

class FeedView(generics.ListAPIView):
    serializer_class = PostSerializer
    def get_queryset(self):
        follow = Follow.objects.filter(follower=self.request.user)
        following_users = follow.values_list('following', flat=True)
        return Post.objects.filter(author__in=following_users).distinct().order_by('-created_at').prefetch_related('comments')
    permission_classes = [IsAuthenticated]