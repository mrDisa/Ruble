from django.urls import path

from .views import CommentDetailView, CommentListCreateView, LikeDetailView, LikeListCreateView, MyPostsDetailView, MyPostsView, PostDetailView, PostListCreateView

urlpatterns = [
    path('posts/', PostListCreateView.as_view()),
    path('posts/<int:pk>/', PostDetailView.as_view()),
    path('myposts/', MyPostsView.as_view()),
    path('myposts/<int:pk>/', MyPostsDetailView.as_view()),
    
    path('', CommentListCreateView.as_view()),
    path('<int:pk>/', CommentDetailView.as_view()),

    path('likes/', LikeListCreateView.as_view()),
    path('likes/<int:pk>/', LikeDetailView.as_view()),
]