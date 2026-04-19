from django.urls import path

from .views import FollowDetailView, FollowListCreateView
urlpatterns = [
    path('', FollowListCreateView.as_view()),
    path('<int:pk>/', FollowDetailView.as_view()),
]