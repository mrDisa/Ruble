# Django REST Framework imports
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly

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
        posts = Post.objects.filter(title__icontains=query)[:5]

        return Response({
            "users": UserSerializer(users, many=True).data,
            "posts": PostSerializer(posts, many=True).data,
        })

# Follows 
class FollowListCreateView(generics.ListCreateAPIView):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, ]

    def perform_create(self, serializer):
        serializer.save(follower=self.request.user)

class FollowDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
