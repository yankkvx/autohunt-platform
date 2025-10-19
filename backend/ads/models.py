from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from datetime import datetime
from catalog.models import Brand, ModelCar, BodyType, FuelType, DriveType, Transmission, Color, InteriorMaterial


class Ad(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE, related_name='ads')

    title = models.CharField(max_length=200, blank=False)
    description = models.TextField(max_length=500, blank=True, null=True)

    brand = models.ForeignKey(Brand, on_delete=models.CASCADE)
    model = models.ForeignKey(ModelCar, on_delete=models.CASCADE)
    body_type = models.ForeignKey(
        BodyType, on_delete=models.SET_NULL, null=True)
    fuel_type = models.ForeignKey(
        FuelType, on_delete=models.SET_NULL, null=True)
    drive_type = models.ForeignKey(
        DriveType, on_delete=models.SET_NULL, null=True)
    transmission = models.ForeignKey(
        Transmission, on_delete=models.SET_NULL, null=True)
    exterior_color = models.ForeignKey(
        Color, on_delete=models.SET_NULL, null=True, related_name='exterior_color')
    interior_color = models.ForeignKey(
        Color, on_delete=models.SET_NULL, null=True, related_name='interior_color')
    interior_material = models.ForeignKey(
        InteriorMaterial, on_delete=models.SET_NULL, null=True)

    year = models.PositiveIntegerField(null=True)
    mileage = models.PositiveIntegerField(null=True)

    power = models.PositiveIntegerField(null=True, blank=True)  # hp
    capacity = models.DecimalField(
        # liters
        max_digits=3, decimal_places=1, null=True, blank=True, validators=[MinValueValidator(0)])

    battery_power = models.PositiveIntegerField(null=True, blank=True)  # kW
    battery_capacity = models.DecimalField(
        # kWh
        max_digits=5, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])

    price = models.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    vin = models.CharField(max_length=20, null=True, blank=True)
    location = models.CharField(max_length=150, null=True, blank=True)
    warranty = models.BooleanField(default=False)
    airbag = models.BooleanField(default=False)
    air_conditioning = models.BooleanField(default=False)
    number_of_seats = models.PositiveIntegerField(
        null=True, blank=True, validators=[MinValueValidator(1)])
    number_of_doors = models.PositiveIntegerField(
        null=True, blank=True, validators=[MinValueValidator(1)])
    condition = models.CharField(
        max_length=50,
        choices=[
            ('new', 'New'),
            ('used', 'Used'),
            ('damaged', 'Damaged'),
            ('restored', 'Restored'),
            ('drowned', 'Drowned'),
        ],
        default='used')
    owner_count = models.PositiveIntegerField(null=True, blank=True)
    is_first_owner = models.BooleanField(default=False)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Ad {self.id}: {self.user.email} - {self.brand} - {self.model}'

    def clean(self):
        super().clean()

        if self.fuel_type and self.fuel_type.name.lower() in ['electric', 'hybrid']:
            if self.battery_capacity is None:
                raise ValidationError(
                    {'battery_capacity': 'Battery capacity is required for this engine type.'})
            if self.battery_power is None:
                raise ValidationError(
                    {'battery_power': 'Battery power is required for this engine type.'})
        else:
            if self.capacity is None:
                raise ValidationError(
                    {'capacity': 'Capacity is required for non-electric cars.'})
            if self.power is None:
                raise ValidationError(
                    {'power': 'Power is required for non-electric cars.'})

            self.battery_capacity = None
            self.battery_power = None

        if self.year and (self.year < 1850 or self.year > datetime.now().year + 1):
            raise ValidationError({'year': 'Invalid production year.'})

    class Meta:
        ordering = ['-created_at']


class AdImage(models.Model):
    ad = models.ForeignKey(Ad, on_delete=models.CASCADE,
                           null=True, related_name='images')
    image = models.ImageField(null=True, blank=True, upload_to='images/ads')

    def __str__(self):
        return f'Image for Ad №{self.ad.id}' if self.ad else 'Unlinked image'


class Favourite(models.Model):
    ad = models.ForeignKey(Ad, on_delete=models.CASCADE,)
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('ad', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} - {self.ad.id}'
