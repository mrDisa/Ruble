from django.urls import path

from .views import UserAPIList, UserDetailView, UserMeView, UserRegisterAPIView
urlpatterns = [
    path('register/', UserRegisterAPIView.as_view()),
    path('', UserAPIList.as_view()),
    path('<int:pk>/', UserDetailView.as_view()),
    path('me/', UserMeView.as_view()),
]