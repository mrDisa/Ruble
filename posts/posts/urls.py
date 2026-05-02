from django.urls import path

from posts.views import (
    CommentLikeToggleView,
    MyPostsDetailView, 
    MyPostsView,
    PostCommentsView, 
    PostDetailView, 
    PostListCreateView,
    PostRatingView, 
    ToggleLikeView, 
    UserPostsListView
)

urlpatterns = [
    # --- ПОСТЫ ---
    path('', PostListCreateView.as_view()),
    path('<int:pk>/', PostDetailView.as_view()),
    path('<int:post_id>/like/', ToggleLikeView.as_view()), 
    path('<int:pk>/comments/', PostCommentsView.as_view()),
    path('<int:post_id>/comments/<int:comment_id>/like/', CommentLikeToggleView.as_view()),
    path('<int:post_id>/rate/', PostRatingView.as_view()),
    
    # --- МОИ ПОСТЫ ---
    path('myposts/', MyPostsView.as_view()),
    path('myposts/<int:pk>/', MyPostsDetailView.as_view()),

    path('user/<int:user_id>/', UserPostsListView.as_view()),
]