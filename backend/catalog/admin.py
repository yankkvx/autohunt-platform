from django.contrib import admin
from .models import Brand, ModelCar, BodyType, FuelType, DriveType, Transmission, Color, InterriorMaterial
# Register your models here.


admin.site.register(Brand)
admin.site.register(ModelCar)
admin.site.register(BodyType)
admin.site.register(FuelType)
admin.site.register(DriveType)
admin.site.register(Transmission)
admin.site.register(Color)
admin.site.register(InterriorMaterial)