from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import CustomUserManager


class User(AbstractUser):
    ACCOUNT_PRIVATE = 'private'
    ACCOUNT_COMPANY = 'company'
    ACCOUNT_TYPES = (
        (ACCOUNT_PRIVATE, 'Private'),
        (ACCOUNT_COMPANY, 'Company')
    )
    account_type = models.CharField(
        max_length=10, choices=ACCOUNT_TYPES, default=ACCOUNT_PRIVATE)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=30, unique=True)
    first_name = models.CharField(max_length=25)
    last_name = models.CharField(max_length=25)
    about = models.TextField(max_length=250, null=True, blank=True)
    profile_image = models.ImageField(
        upload_to='images/profiles/', blank=True, null=True, default='defaults/default_profile.png')
    telegram = models.URLField(blank=True, null=True)
    twitter = models.URLField(blank=True, null=True)
    instagram = models.URLField(blank=True, null=True)

    # Company fields
    company_name = models.CharField(max_length=155, blank=True, null=True)
    company_website = models.URLField(blank=True, null=True)
    company_office = models.CharField(max_length=255, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return f'{self.id} - {self.email}'
