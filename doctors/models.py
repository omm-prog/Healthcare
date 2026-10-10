from django.db import models


class Doctor(models.Model):
    """
    Doctor model representing healthcare professionals in the directory.
    """
    name = models.CharField(max_length=255, verbose_name="Full Name")
    specialization = models.CharField(max_length=255, verbose_name="Medical Specialization")
    email = models.EmailField(
        max_length=255,
        blank=True,
        default='',
        verbose_name="Contact Email"
    )
    phone = models.CharField(
        max_length=30,
        blank=True,
        default='',
        verbose_name="Contact Phone"
    )
    clinic_address = models.TextField(
        blank=True,
        default='',
        verbose_name="Clinic Address"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Doctor'
        verbose_name_plural = 'Doctors'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['specialization']),
            models.Index(fields=['name']),
        ]

    def __str__(self):
        return f"Dr. {self.name} ({self.specialization})"
