from django.db import models

from users.models import User

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100, blank=True, null=True)
    content = models.TextField(max_length=600)
    media = models.ImageField(upload_to='media/%Y%m%d', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Автор: {self.author}, Заголовок поста: {self.title}"

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
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    
    def __str__(self):
        return f"{self.user} лайкнул пост {self.post.title}"