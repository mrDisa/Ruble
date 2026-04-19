from django.contrib import admin

from users.models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'username', 'job', 'rank']
    search_fields = ['first_name', 'username']