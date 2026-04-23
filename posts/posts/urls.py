from django.urls import path

from posts.views import (
    MyPostsDetailView, 
    MyPostsView, 
    PostDetailView, 
    PostListCreateView, 
    ToggleLikeView, 
    UserPostsListView
)

urlpatterns = [
    # --- ПОСТЫ ---
    path('', PostListCreateView.as_view()),
    path('<int:pk>/', PostDetailView.as_view()),
    path('<int:post_id>/like/', ToggleLikeView.as_view()), 
    
    # --- МОИ ПОСТЫ ---
    path('myposts/', MyPostsView.as_view()),
    path('myposts/<int:pk>/', MyPostsDetailView.as_view()),

    path('user/<int:user_id>/', UserPostsListView.as_view()),
]