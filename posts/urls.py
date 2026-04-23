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
    
]