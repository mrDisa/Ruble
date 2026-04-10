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