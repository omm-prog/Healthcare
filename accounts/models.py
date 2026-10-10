from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone
from accounts.managers import CustomUserManager


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model using email as unique identifier for authentication.
    """
    name = models.CharField(max_length=255, verbose_name="Full Name")
    email = models.EmailField(
        max_length=255,
        unique=True,
        db_index=True,
        verbose_name="Email Address"
    )
    is_staff = models.BooleanField(
        default=False,
        help_text="Designates whether the user can log into the admin site."
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Designates whether this user should be treated as active."
    )
    date_joined = models.DateTimeField(default=timezone.now)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.name} <{self.email}>"

    def clean(self):
        super().clean()
        if self.email:
            self.email = self.email.lower()
