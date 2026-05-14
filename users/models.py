from users.managers import CustomUserManager
from django.db import models
from django.contrib.auth.models import AbstractUser
from users.managers import UserQuerySet

class User(AbstractUser):
    bio = models.TextField(max_length=500, blank=True, null=True, verbose_name='О себе')
    
    job = models.CharField(max_length=50, verbose_name='Текущая работа', default='Не указана', blank=True, null=True)
    rank = models.CharField(max_length=50, verbose_name='Ранг', default='Новичок', blank=True, null=True)
    rank_score = models.FloatField(default=0)
    objects = CustomUserManager()

    avatar = models.ImageField(upload_to='user_avatar', blank=True, null=True, verbose_name='Аватар')
    
    def __str__(self):
        return self.username
    
    def calculate_rank(self):
        score = (
            (getattr(self, "total_post_score", 0) * 25)
            + (getattr(self, "total_post_likes", 0) * 1)
            + (getattr(self, "total_comment_likes", 0) * 2)
            + (getattr(self, "comments_count", 0) * 3)
            + (getattr(self, "posts_count", 0) * 5)
        )

        if score >= 6000:
            return "Ключевой автор"

        elif score >= 4000:
            return "Опорный автор"

        elif score >= 2500:
            return "Влиятельный автор"

        elif score >= 1500:
            return "Активный автор"

        elif score >= 800:
            return "Ценный автор"

        elif score >= 300:
            return "Полезный пользователь"

        elif score >= 100:
            return "Активный пользователь"

        return "Наблюдатель"