from django.contrib import admin
from django.urls import include, path
from django.conf.urls.static import static

from main import views
from posts.views import CommentDetailView, CommentListCreateView, LikeDetailView, LikeListCreateView, MyPostsDetailView, PostDetailView,  PostListCreateView, MyPostsView
from feed.views import FeedAPIView, FeedView
from users.views import UserAPIList, UserDetailView, UserMeView, UserRegisterAPIView
from interactions.views import FollowListCreateView, FollowDetailView
from . import settings

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.mainView, name='main'),
    
    # jwt login
    path("api/v1/token/", TokenObtainPairView.as_view()),
    path("api/v1/token/refresh/", TokenRefreshView.as_view()),

    # feed
    path('api/v1/feed/', FeedAPIView.as_view()),
    path('feed/', FeedView, name='feed'),

    # users
    path('api/v1/users/', include('users.urls')),

    # posts
    path('api/v1/', include('posts.urls')),
    path('api/v1/comments/', include('posts.urls')),
    path('api/v1/follows/', include('interactions.urls')),
    path('api/v1/likes/', include('posts.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)