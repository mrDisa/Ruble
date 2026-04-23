from django.urls import path

from posts.views import CommentDetailView, CommentListCreateView

urlpatterns = [
    # --- КОММЕНТАРИИ ---
    path('', CommentListCreateView.as_view()),
    path('<int:pk>/', CommentDetailView.as_view()),
]