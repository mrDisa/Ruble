from django.contrib import admin

from users.models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['firstname', 'username', 'job', 'rank']
    search_fields = ['firstname', 'username']