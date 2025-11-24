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
    phone_number = models.CharField(max_length=30, unique=True, null=True, blank=True)
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

    # Location fields
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True)
    city = models.CharField(max_length=150, null=True, blank=True)
    state = models.CharField(max_length=150, null=True, blank=True)
    country = models.CharField(max_length=150, null=True, blank=True)
    country_code = models.CharField(max_length=2, null=True, blank=True)
    postcode = models.CharField(max_length=50, null=True, blank=True)
    full_address = models.CharField(max_length=300, null=True, blank=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return f'{self.id} - {self.email}'

    def get_location_display(self):
        parts = []
        if self.city:
            parts.append(self.city)
        if self.state:
            parts.append(self.state)
        if self.country:
            parts.append(self.country)
        if parts:
            return ', '.join(parts)

        return self.company_website or 'Location not specified'

    def set_location_from_geocode(self, geocode_data: dict):
        self.full_address = geocode_data.get('display_name')
        self.latitude = geocode_data.get('latitude')
        self.longitude = geocode_data.get('longitude')
        address = geocode_data.get('address', {})
        self.city = address.get('city')
        self.state = address.get('state')
        self.country = address.get('country')
        self.country_code = address.get('country_code')
        self.postcode = address.get('postcode')

        self.company_office = self.get_location_display()
