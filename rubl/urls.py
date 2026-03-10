from django.contrib import admin
from django.urls import path
from django.conf.urls.static import static

from main import views
from main.views import CommentAPIList, FollowAPIList, PostDetailView,  PostListCreateView, UserAPIList

from . import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.mainView, name='main'),
    path('api/v1/users/', UserAPIList.as_view()),
    
    path('api/v1/posts/', PostListCreateView.as_view()),
    path('api/v1/posts/<int:pk>/', PostDetailView.as_view()),

    
    path('api/v1/comments/', CommentAPIList.as_view()),
    path('api/v1/follows/', FollowAPIList.as_view()),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)