from django.shortcuts import render
from rest_framework import generics, viewsets
from .serializer import FollowSerializer, CommentSerializer, PostSerializer, UserSerializer
from .models import Follow, Post, User, Comment
from rest_framework.response import Response
from rest_framework import status

from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from .permissions import IsOwnerOrReadOnly

def mainView(request):
    return render(request, 'main/base.html')

# ЮЗЕРЫ
class UserAPIList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# ПОСТЫ
class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    
class CommentAPIList(generics.ListAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    
class FollowAPIList(generics.ListAPIView):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer