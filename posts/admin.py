from django.contrib import admin

from .models import Post, Comment, Like

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['author', 'content']
    search_fields = ['author']
    
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['author', 'post', 'text']
    search_fields = ['author', 'post', 'text']

@admin.register(Like)
class FollowAdmin(admin.ModelAdmin):
    list_display = ['user', 'post']
    search_fields = ['user', 'post']