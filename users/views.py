from django.shortcuts import render
from rest_framework import generics

from users.serializers import UserSerializer
from users.models import User
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from main.permissions import IsOwnerOrReadOnly

class UserAPIList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

class UserMeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user