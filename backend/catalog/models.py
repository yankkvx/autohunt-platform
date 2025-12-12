from django.db import models


class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True, db_index=True)

    def __str__(self):
        return self.name


class ModelCar(models.Model):
    brand = models.ForeignKey(
        Brand, on_delete=models.CASCADE, related_name='models', db_index=True)
    name = models.CharField(max_length=150)

    class Meta:
        unique_together = ('brand', 'name')
        ordering = ['brand__name', 'name']
        verbose_name = 'Model'
        verbose_name_plural = 'Models'

    def __str__(self):
        return f'{self.brand.name} - {self.name}'


class BodyType(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Body type'
        verbose_name_plural = 'Body types'

    def __str__(self):
        return self.name


class FuelType(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Fuel type'
        verbose_name_plural = 'Fuel types'

    def __str__(self):
        return self.name


class DriveType(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Drive type'
        verbose_name_plural = 'Drive types'

    def __str__(self):
        return self.name


class Transmission(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Transmission'
        verbose_name_plural = 'Transmissions'

    def __str__(self):
        return self.name


class Color(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Color'
        verbose_name_plural = 'Colors'

    def __str__(self):
        return self.name


class InteriorMaterial(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Interior material'
        verbose_name_plural = 'Interior materials'

    def __str__(self):
        return self.name
