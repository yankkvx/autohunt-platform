from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser, AllowAny
from .models import Brand, ModelCar, BodyType, FuelType, DriveType, Transmission, Color, InteriorMaterial
from .serializers import BrandSerializer, ModelCarSerializer, BodyTypeSerializer, FuelTypeSerializer, DriveTypeSerializer, TransmissionSerializer, ColorSerializer, InteriorMaterialSerializer


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


class ModelCarViewSet(viewsets.ModelViewSet):
    queryset = ModelCar.objects.select_related('brand').all()
    serializer_class = ModelCarSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


class BodyTypeViewSet(viewsets.ModelViewSet):
    queryset = BodyType.objects.all()
    serializer_class = BodyTypeSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


class FuelTypeViewSet(viewsets.ModelViewSet):
    queryset = FuelType.objects.all()
    serializer_class = FuelTypeSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


class DriveTypeViewSet(viewsets.ModelViewSet):
    queryset = DriveType.objects.all()
    serializer_class = DriveTypeSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


class TransmissionViewSet(viewsets.ModelViewSet):
    queryset = Transmission.objects.all()
    serializer_class = TransmissionSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


class ColorViewSet(viewsets.ModelViewSet):
    queryset = Color.objects.all()
    serializer_class = ColorSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


class InteriorMaterialViewSet(viewsets.ModelViewSet):
    queryset = InteriorMaterial.objects.all()
    serializer_class = InteriorMaterialSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]
