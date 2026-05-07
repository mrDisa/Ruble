from django.db.models import F, ExpressionWrapper, FloatField
from django.db.models.functions import Coalesce, Now, Extract, Ln, Exp
from urllib import request

from django.shortcuts import render
from django.utils import timezone

from rest_framework import generics

from interactions.models import Follow
from posts.models import Post
from posts.serializers import PostSerializer
from rest_framework.permissions import IsAuthenticated

from django.views.generic import ListView

def FeedView(request):
    return render(request, 'feed/feed.html')

class FeedFollowsAPIView(generics.ListAPIView):
    serializer_class = PostSerializer
    def get_queryset(self):
        follow = Follow.objects.filter(follower=self.request.user).select_related("author").prefetch_related("likes", "comments")
        following_users = follow.values_list('following', flat=True)
        return Post.objects.filter(author__in=following_users).distinct().order_by('-created_at').prefetch_related('likes', 'comments')
    permission_classes = [IsAuthenticated]

class FeedAPIView(generics.ListAPIView):
    serializer_class = PostSerializer

    def get_queryset(self):
        return Post.objects.with_score().order_by('-score')