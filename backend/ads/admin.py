from django.contrib import admin
from .models import Brand, ModelCar, BodyType, FuelType, DriveType, Transmisson, Color, InteriorMaterial, Ad

# Register your models here.
admin.site.register(Brand)
admin.site.register(ModelCar)
admin.site.register(BodyType)
admin.site.register(FuelType)
admin.site.register(DriveType)
admin.site.register(Transmisson)
admin.site.register(Color)
admin.site.register(InteriorMaterial)
admin.site.register(Ad)
