from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from phonenumber_field.modelfields import PhoneNumberField
from .managers import UserManager
from django.core.exceptions import ValidationError
# Create your models here.


class User(AbstractBaseUser, PermissionsMixin):
    ACCOUNT_TYPE_PRIVATE = 'private'
    ACCOUNT_TYPE_COMPANY = 'company'
    ACCOUNT_TYPE_CHOICES = (
        (ACCOUNT_TYPE_PRIVATE, 'Private'),
        (ACCOUNT_TYPE_COMPANY, 'Company')
    )

    email = models.EmailField(unique=True)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPE_CHOICES)
    first_name = models.CharField(max_length=20, blank=True)
    last_name = models.CharField(max_length=20, blank=True)
    phone_number = PhoneNumberField(blank=True, null=True, unique=True)
    company_name = models.CharField(max_length=100, blank=True, null=True)
    company_office = models.CharField(max_length=255, blank=True, null=True)
    company_website = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    # Use the email as unique identifier for authentication instead of username.
    USERNAME_FIELD = 'email'
    # List of fields required when creating a superuser.
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

    def clean(self):
        """Validate fields based on the account types"""
        super().clean()
        if self.account_type == self.ACCOUNT_TYPE_COMPANY:
            missing_fields = []
            if not self.company_name:
                missing_fields.append('Company name')
            if not self.company_office:
                missing_fields.append('Company office address')
            if missing_fields:
                raise ValidationError(
                    f"{', '.join(missing_fields)} {'is' if len(missing_fields) == 1 else 'are'} required for company account.")
        else:
            self.company_name = None
            self.company_office = None
            self.company_website = None
