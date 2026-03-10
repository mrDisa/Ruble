from urllib import request

from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    firstname = models.CharField(max_length=16, verbose_name='Имя')
    username = models.CharField(max_length=16, unique=True, verbose_name='Юзернейм')
    job = models.CharField(max_length=50, verbose_name='Текущая работа', default='Не указана')
    rank = models.CharField(max_length=50, verbose_name='Ранг', default='Новичок')
    avatar = models.ImageField(upload_to='user_avatar')
    
    def __str__(self):
        return self.username

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=20)
    content = models.TextField(max_length=500)
    media = models.ImageField(upload_to='media/%Y%m%d', blank=True)
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True)
    
    def __str__(self):
        return f"Автор: {self.author}, Заголовок поста: {self.title}"
    
class Comment(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    text = models.TextField(max_length=300)
    media = models.ImageField(upload_to='media_comments/%Y/%m%d', blank=True)
    created_at = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return f'Автор комментария: {self.author}, Название поста: {self.post}'
    
class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following_users')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateField(auto_now_add=True)
    
    class Meta: 
        unique_together = [['follower', 'following']]
    
    def __str__(self):
        return f'{self.follower} подписан на {self.following}'
    
