from django.contrib import admin
from django.urls import include, path
from django.conf.urls.static import static
from django.views.generic import TemplateView # Импорт для HTML-страниц

# Оставили только нужные импорты
from main import views
from feed.views import FeedAPIView, FeedFollowsAPIView, FeedView
from interactions.views import SearchView
from . import settings
from django.views.generic import RedirectView

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # === АДМИНКА ===
    path('admin/', admin.site.urls),
    path('', RedirectView.as_view(url='/feed/', permanent=False)),

    # === СТРАНИЦЫ ДЛЯ ЛЮДЕЙ (HTML) ===
    # path('', views.mainView, name='main'),
    path('feed/', FeedView, name='feed'),
    # Наши новые красивые ссылки для авторизации
    path('signup/', TemplateView.as_view(template_name='users/register.html'), name='signup_page'),
    path('login/', TemplateView.as_view(template_name='users/login.html'), name='login_page'),

    # === API ЭНДПОИНТЫ (Для работы JS и базы данных) ===
    
    # 1. JWT Авторизация
    path("api/v1/token/", TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path("api/v1/token/refresh/", TokenRefreshView.as_view(), name='token_refresh'),

    # 2. Лента API
    path('api/v1/feed/follows/', FeedFollowsAPIView.as_view(), name='api_feed'),
    path("api/v1/feed/", FeedAPIView.as_view(), name="feed"),

    # 3. Маршруты приложений
    path('api/v1/', include('main.api.urls')),
    path('api/v1/search/', SearchView.as_view()),
    path('profile/<int:pk>/', TemplateView.as_view(template_name='users/profile.html'), name='profile_page'),

    path('api/v1/interactions/', include('interactions.urls')),
    path('api/v1/notifications/', include('notifications.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)