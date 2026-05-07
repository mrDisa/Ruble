# Django REST Framework imports
from django.db import IntegrityError
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from django.db.models import Q
# Other 
from posts.models import Post
from posts.serializers import PostSerializer
from users.serializers import UserSerializer
from users.models import User
from .permissions import IsOwnerOrReadOnly
from .serializers import FollowSerializer
from .models import Follow

# Search 
class SearchView(APIView):
    def get(self, request):
        query = request.query_params.get("q", "")

        users = User.objects.filter(username__icontains=query)[:5]
        
        posts = (
            Post.objects
            .with_score()
            .filter(
                Q(title__icontains=query) |
                Q(content__icontains=query)
            )
            .order_by('-score')[:5]
        )

        return Response({
            "users": UserSerializer(users, many=True).data,
            "posts": PostSerializer(posts, many=True).data,
        })

# Follows 
class FollowListCreateView(generics.ListCreateAPIView):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, ]

    # Перехватываем создание, чтобы поймать ошибку дубликата
    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except IntegrityError:
            # Если такой фоллоу уже есть, отдаем 400 вместо 500
            return Response(
                {"detail": "Вы уже подписаны на этого пользователя."},
                status=status.HTTP_400_BAD_REQUEST
            )

    def perform_create(self, serializer):
        serializer.save(follower=self.request.user)

class FollowDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer
    permission_classes = [IsAuthenticated]

    # Переопределяем метод поиска объекта для удаления
    def get_object(self):
        # Достаем ID пользователя из URL (в твоем случае это цифра 3)
        target_user_id = self.kwargs['pk']
        
        # Ищем в базе именно ту подписку, где текущий юзер подписан на target_user_id
        # Если в твоей модели поле называется не 'following', а 'user' - поменяй 'following_id' на 'user_id'
        obj = get_object_or_404(Follow, follower=self.request.user, following_id=target_user_id)
        
        # Проверяем права и возвращаем найденную подписку для удаления
        self.check_object_permissions(self.request, obj)
        return obj