from django.contrib import admin
from accounts.models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'is_active', 'is_staff', 'is_superuser', 'date_joined')
    search_fields = ('name', 'email')
    list_filter = ('is_active', 'is_staff', 'is_superuser')
    ordering = ('-date_joined',)
