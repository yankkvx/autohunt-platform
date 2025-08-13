from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


# Represents a car brand (Toyota, BMW)
class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)


# Represents a car model associated with a brand (Supra, M series)
class ModelCar(models.Model):
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE)
    name = models.CharField(max_length=150)

    def __str__(self):
        return self.name


# Represents the type of car body (sedan, SUV)
class BodyType(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


# Represents fuel types (petrol, diesel, electric)
class FuelType(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


# Represents drive types (FWD, RWD, AWD)
class DriveType(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


# Represents trasmission types (manual, automatic)
class Transmisson(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


# Represents car exterioir and interior colors
class Color(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


# Represents interior material (leather, fabric)
class InteriorMaterial(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


# Represents a car advertisement
class Ad(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    title = models.CharField(max_length=200, blank=True)
    description = models.TextField(max_length=700, blank=True, null=True)
    year = models.PositiveIntegerField(null=True, blank=True)
    mileage = models.PositiveIntegerField(null=True, blank=True)
    power = models.PositiveIntegerField(null=True, blank=True)
    capacity = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True)
    battery_power = models.PositiveIntegerField(null=True, blank=True)
    battery_capacity = models.PositiveIntegerField(null=True, blank=True)
    location = models.CharField(max_length=300, blank=True, null=True)
    vin = models.CharField(max_length=50, null=True, blank=True, unique=True)

    # Realtions to other models
    brand = models.ForeignKey(
        Brand, on_delete=models.SET_NULL, null=True, blank=True)
    model = models.ForeignKey(
        ModelCar, on_delete=models.SET_NULL, null=True, blank=True)
    body_type = models.ForeignKey(
        BodyType, on_delete=models.SET_NULL, null=True, blank=True)
    fuel_type = models.ForeignKey(
        FuelType, on_delete=models.SET_NULL, null=True, blank=True)
    drive_type = models.ForeignKey(
        DriveType, on_delete=models.SET_NULL, null=True, blank=True)
    transmisson = models.ForeignKey(
        Transmisson, on_delete=models.SET_NULL, null=True, blank=True)
    exterior_color = models.ForeignKey(
        Color, on_delete=models.SET_NULL, null=True, blank=True, related_name='exterior_color')
    interior_color = models.ForeignKey(
        Color, on_delete=models.SET_NULL, null=True, blank=True, related_name='interior_color')
    interior_material = models.ForeignKey(
        InteriorMaterial, on_delete=models.SET_NULL, null=True, blank=True)

    # Additional features
    warranty = models.BooleanField(default=False)
    airbag = models.BooleanField(default=False)
    air_conditioning = models.BooleanField(default=False)
    number_of_seats = models.PositiveIntegerField(null=True, blank=True)
    number_of_doors = models.PositiveIntegerField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.user} - {self.brand}, {self.model}'

    def clean(self):
        """
        Validation logic based on fuel type.
        Electric cars require battery_power and battery_capacity
        Non-electric cars reuire power and capacity
        Ensures field irrelevant to the fueltype are cleared
        """
        super().clean()

        electric_types = ['Electric', 'Hybrid']
        if self.fuel_type and self.fuel_type.name in electric_types:
            if self.battery_capacity is None:
                raise ValidationError(
                    {'battery_capacity': 'Battery capacity is required for this engine type.'})
            if self.battery_power is None:
                raise ValidationError(
                    {'battery_power': 'Battery power is required for this engine type.'})
        else:
            if self.capacity is None:
                raise ValidationError(
                    {'capacity': 'Capacity is required for non-electirc cars.'})
            if self.power is None:
                raise ValidationError(
                    {'power': 'Power is required for non-electric cars.'})

            self.battery_capacity = None
            self.battery_power = None
