from django.contrib import admin
from doctors.models import Doctor


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'specialization', 'email', 'phone', 'created_at')
    list_filter = ('specialization', 'created_at')
    search_fields = ('name', 'specialization', 'email')
    ordering = ('-created_at',)
