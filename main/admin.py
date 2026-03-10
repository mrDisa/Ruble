from django.contrib import admin

from .models import User, Post, Comment, Follow

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['firstname', 'username', 'job', 'rank']
    search_fields = ['firstname', 'username']
    
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['author', 'content']
    search_fields = ['author']
    
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['author', 'post', 'text']
    search_fields = ['author', 'post', 'text']
    
@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ['follower', 'following']
    search_fields = ['follower', 'following']