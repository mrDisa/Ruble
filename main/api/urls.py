from django.urls import include, path

urlpatterns = [
    path('users/', include('users.urls')),
    path('follows/', include('interactions.urls')),
    path('posts/', include('posts.posts.urls')),
    path('comments/', include('posts.comments.urls')),
    path('notifications/', include('notifications.urls')),
]