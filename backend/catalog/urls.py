from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BrandViewSet, ModelCarViewSet, BodyTypeViewSet, FuelTypeViewSet, DriveTypeViewSet, TransmissionViewSet, ColorViewSet, InteriorMaterialViewSet

router = DefaultRouter()
router.register('brands', BrandViewSet)
router.register('models', ModelCarViewSet)
router.register('body-types', BodyTypeViewSet)
router.register('fuel-types', FuelTypeViewSet)
router.register('drive-types', DriveTypeViewSet)
router.register('transmissions', TransmissionViewSet)
router.register('colors', ColorViewSet)
router.register('interior-materials', InteriorMaterialViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
