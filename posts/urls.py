from django.urls import path

# Не забудь добавить ToggleLikeView в импорт из .views!
from .views import (
    CommentDetailView, CommentListCreateView, 
    MyPostsDetailView, MyPostsView, 
    PostDetailView, PostListCreateView,
    ToggleLikeView,
    UserPostsListView 
)

urlpatterns = [
    # --- ПОСТЫ ---
    path('posts/', PostListCreateView.as_view()),
    path('posts/<int:pk>/', PostDetailView.as_view()),
    
    # ЛАЙКИ
    path('posts/<int:post_id>/like/', ToggleLikeView.as_view()), 
    
    # --- МОИ ПОСТЫ ---
    path('myposts/', MyPostsView.as_view()),
    path('myposts/<int:pk>/', MyPostsDetailView.as_view()),
    
    # --- КОММЕНТАРИИ ---
    path('comments/', CommentListCreateView.as_view()),
    path('comments/<int:pk>/', CommentDetailView.as_view()),

    path('posts/user/<int:user_id>/', UserPostsListView.as_view()),
]