from urllib import request

from django.shortcuts import render
from rest_framework import generics

from posts.models import Comment, Like, Post
# from rest_framework.permissions import SAFE_METHODS, BasePermission
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from interactions.permissions import IsOwnerOrReadOnly

from .serializers import PostSerializer, CommentSerializer, LikeSerializer

# POSTS
class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

class MyPostsView(generics.ListAPIView):
    def get_queryset(self):
        return Post.objects.filter(author=self.request.user).order_by('-id')
    serializer_class = PostSerializer
    
class MyPostsDetailView(generics.RetrieveUpdateDestroyAPIView):
    def get_queryset(self):
        return Post.objects.filter(author=self.request.user)
    serializer_class = PostSerializer
# COMMENTS
class CommentListCreateView(generics.ListCreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, ]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

# LIKES
class LikeListCreateView(generics.ListCreateAPIView):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, ]

class LikeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]