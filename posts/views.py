# Django
from django.shortcuts import get_object_or_404

# Django REST Framework
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

# Локальные импорты
from interactions.permissions import IsOwnerOrReadOnly
from posts.models import Comment, Like, Post
from .serializers import CommentSerializer, LikeSerializer, PostSerializer


# ==========================================
# POSTS
# ==========================================

class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]


class MyPostsView(generics.ListAPIView):
    serializer_class = PostSerializer

    def get_queryset(self):
        return Post.objects.filter(author=self.request.user).order_by('-id')


class MyPostsDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PostSerializer

    def get_queryset(self):
        return Post.objects.filter(author=self.request.user)


# ==========================================
# COMMENTS
# ==========================================

class CommentListCreateView(generics.ListCreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]


# ==========================================
# LIKES
# ==========================================

class ToggleLikeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        like_qs = Like.objects.filter(user=request.user, post=post)
        
        if like_qs.exists():
            like_qs.delete()
            return Response({"detail": "Лайк убран", "is_liked": False}, status=status.HTTP_200_OK)
        
        Like.objects.create(user=request.user, post=post)
        return Response({"detail": "Лайк поставлен", "is_liked": True}, status=status.HTTP_201_CREATED)
    
# ==========================================
# PROFILE
# ==========================================

class UserPostsListView(generics.ListAPIView):
    serializer_class = PostSerializer

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return Post.objects.filter(author_id=user_id).order_by('-created_at')