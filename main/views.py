from django.shortcuts import render
from rest_framework import generics, viewsets
from .serializers import FollowSerializer
from .models import Follow
from rest_framework.response import Response
from rest_framework import status

from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from .permissions import IsOwnerOrReadOnly

def mainView(request):
    return render(request, 'main/base.html')    

# FOLLOWS
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
