from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.validators import MaxValueValidator, MinValueValidator
from django.shortcuts import get_object_or_404

from .managers import PostQuerySet
from users.models import User


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100, blank=True, null=True)
    content = models.TextField(max_length=600, blank=True, null=True)
    media = models.ImageField(upload_to='media/%Y%m%d', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    rating_avg = models.FloatField(default=0)
    rating_count = models.IntegerField(default=0)

    objects = PostQuerySet.as_manager()
    
    def __str__(self):
        return f"Автор: {self.author}, Заголовок поста: {self.title}"
    

class PostRating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    value = models.IntegerField(validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ])
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'post'], name='unique_user_post')
        ]

class Comment(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField(max_length=300)
    media = models.ImageField(upload_to='media_comments/%Y/%m%d', blank=True)
    created_at = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return f'Автор комментария: {self.author}, Название поста: {self.post}'

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='who_liked')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True, related_name='likes')
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user} лайкнул пост {self.post.title}"
        
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "post"], name="unique_post_like"),
            models.UniqueConstraint(fields=["user", "comment"], name="unique_comment_like"),
        ]

# === СИГНАЛ (ТРИГГЕР) ДЛЯ СОЗДАНИЯ УВЕДОМЛЕНИЙ ===
@receiver(post_save, sender=Post)
def create_notification_for_new_post(sender, instance, created, **kwargs):
    if created:
        # Прячем импорты внутрь функции
        from interactions.models import Follow
        from notifications.models import Notification
        
        followers = Follow.objects.filter(following=instance.author)
        notifications = []
        for follow in followers:
            notifications.append(
                Notification(
                    user=follow.follower,           
                    actor=instance.author,          
                    type=Notification.NotificationType.NEW_POST, 
                    post=instance                   
                )
            )
        
        if notifications:
            Notification.objects.bulk_create(notifications)