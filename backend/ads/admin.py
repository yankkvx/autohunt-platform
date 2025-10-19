from django.contrib import admin
from .models import Ad, AdImage, Favourite
# Register your models here.

admin.site.register(Ad)
admin.site.register(AdImage)
admin.site.register(Favourite)
