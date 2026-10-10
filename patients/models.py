from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class GenderChoices(models.TextChoices):
    MALE = 'Male', 'Male'
    FEMALE = 'Female', 'Female'
    OTHER = 'Other', 'Other'


class Patient(models.Model):
    """
    Patient model representing health records isolated per authenticated user owner.
    """
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='patients',
        db_index=True,
        verbose_name="Record Owner"
    )
    name = models.CharField(max_length=255, verbose_name="Full Name")
    age = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(150)],
        verbose_name="Age"
    )
    gender = models.CharField(
        max_length=20,
        choices=GenderChoices.choices,
        verbose_name="Gender"
    )
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
    address = models.TextField(
        blank=True,
        default='',
        verbose_name="Residential Address"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Patient'
        verbose_name_plural = 'Patients'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['owner', 'name']),
            models.Index(fields=['owner', '-created_at']),
        ]

    def __str__(self):
        return f"{self.name} (Age: {self.age}, {self.gender})"
