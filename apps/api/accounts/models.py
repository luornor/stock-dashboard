from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # Enforce email unique and use it as username-like identifier
    email = models.EmailField(unique=True)
    google_sub = models.CharField(max_length=64, unique=True, null=True, blank=True)  # Google's stable subject id
    avatar_url = models.URLField(blank=True)
    # We won’t use username in the UI; keep for admin sanity
    REQUIRED_FIELDS = ["email"]
    def save(self, *args, **kwargs):
        # prevent password-based auth by default
        if not self.has_usable_password():
            self.set_unusable_password()
        super().save(*args, **kwargs)
