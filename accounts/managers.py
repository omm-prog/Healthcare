from django.contrib.auth.base_user import BaseUserManager
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifier
    for authentication instead of usernames.
    """

    def create_user(self, email, name, password=None, **extra_fields):
        """Create and save a standard user with the given email, name, and password."""
        if not email:
            raise ValueError(_('An email address is required.'))
        if not name or not name.strip():
            raise ValueError(_('A name is required.'))

        email = self.normalize_email(email).lower()
        extra_fields.setdefault('is_active', True)
        user = self.model(email=email, name=name.strip(), **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        """Create and save a SuperUser with the given email, name, and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, name, password, **extra_fields)
