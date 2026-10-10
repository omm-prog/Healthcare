from django.contrib import admin
from patients.models import Patient


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'age', 'gender', 'owner', 'email', 'phone', 'created_at')
    list_filter = ('gender', 'created_at')
    search_fields = ('name', 'email', 'phone', 'owner__email')
    ordering = ('-created_at',)
