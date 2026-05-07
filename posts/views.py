# Django
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db import models
from django.db.models import F, FloatField, ExpressionWrapper
from django.db.models.functions import Coalesce, Extract, Now
from django.db.models.functions import Ln, Exp

# Django REST Framework
from rest_framework import generics, status, filters
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

# Локальные импорты
from interactions.permissions import IsOwnerOrReadOnly
from .models import Comment, Like, Post
from .serializers import CommentSerializer, PostRatingSerializer, PostSerializer
from .models import PostRating

# ==========================================
# POSTS
# ==========================================

class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "content"]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        return Post.objects.with_score()


class MyPostsView(generics.ListAPIView):
    serializer_class = PostSerializer

    def get_queryset(self):
        return Post.objects.with_score().filter(author=self.request.user).order_by('-id')


class MyPostsDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PostSerializer

    def get_queryset(self):
        return Post.objects.with_score().filter(author=self.request.user)


class PostCommentsView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        post_id = self.kwargs["pk"]
        return Comment.objects.filter(post_id=post_id).order_by("-created_at")

    def perform_create(self, serializer):
        post_id = self.kwargs["pk"]
        serializer.save(
            author=self.request.user,
            post_id=post_id
        )

class PostRatingView(APIView):

    @transaction.atomic()
    def post(self, request, post_id):
        serializer = PostRatingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        value = serializer.validated_data['value']
        post = Post.objects.select_for_update().get(id=post_id)

        rating, created = PostRating.objects.get_or_create(
            user=request.user,
            post=post,
            defaults={'value': value}
        )

        if created:
            post.rating_count += 1
            post.rating_avg = (
                (post.rating_avg * (post.rating_count - 1) + value)
                / post.rating_count
            )

        else:
            old_value = rating.value
            rating.value = value
            rating.save()

            post.rating_avg = (
                (post.rating_avg * post.rating_count - old_value + value)
                / post.rating_count
            )

        post.save()

        return Response({
            "rating_avg": post.rating_avg,
            "rating_count": post.rating_count
        }, status=status.HTTP_200_OK)
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


class CommentLikeToggleView(APIView):
    # ВЕРНУЛИ post_id, так как роутер бэкендера передает его в URL
    def post(self, request, post_id, comment_id):

        if request.user.is_anonymous:
            return Response(status=401)

        # Находим комментарий, дополнительно проверяя, что он принадлежит именно этому посту
        comment = get_object_or_404(Comment, id=comment_id, post_id=post_id)

        like = Like.objects.filter(
            user=request.user,
            comment=comment
        ).first()

        if like:
            like.delete()
            return Response({"liked": False})

        Like.objects.create(
            user=request.user,
            comment=comment
        )

        return Response({"liked": True})


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
        return Post.objects.with_score().filter(author_id=user_id).order_by('-created_at')