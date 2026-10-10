from django.contrib import admin
from mappings.models import PatientDoctor


@admin.register(PatientDoctor)
class PatientDoctorAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'doctor', 'assigned_at')
    search_fields = ('patient__name', 'doctor__name')
    list_filter = ('assigned_at',)
    ordering = ('-assigned_at',)
