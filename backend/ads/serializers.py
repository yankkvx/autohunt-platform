from rest_framework import serializers
from .models import Brand, ModelCar, BodyType, FuelType, DriveType, Transmisson, Color, InteriorMaterial, Ad


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name']


class ModelCarSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)

    class Meta:
        model = ModelCar
        fields = ['id', 'brand', 'name']


class BodyTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BodyType
        fields = ['id', 'name']


class FuelTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FuelType
        fields = ['id', 'name']


class DriveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriveType
        fields = ['id', 'name']


class TransmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transmisson
        fields = ['id', 'name']


class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ['id', 'name']


class InteriorMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = InteriorMaterial
        fields = ['id', 'name']


class AdSerializer(serializers.ModelSerializer):
    brand = serializers.CharField(source='brand.name', read_only=True)
    model = serializers.CharField(source='model.name', read_only=True)
    body_type = serializers.CharField(source='body_type.name', read_only=True)
    fuel_type = serializers.CharField(source='fuel_type.name', read_only=True)
    drive_type = serializers.CharField(source='drive_type.name', read_only=True)
    transmission = serializers.CharField(source='transmisson.name', read_only=True)
    exterior_color = serializers.CharField(source='exterior_color.name', read_only=True)
    interior_color = serializers.CharField(source='interior_color.name', read_only=True)
    interior_material = serializers.CharField(source='interior_material.name', read_only=True)

    class Meta:
        model = Ad
        fields = ['id', 'title', 'description', 'year', 'mileage', 'power', 'capacity', 
                  'battery_power', 'battery_capacity', 'location', 'vin', 'brand', 'model', 
                  'body_type', 'fuel_type', 'drive_type', 'transmission', 'exterior_color',
                  'interior_color', 'interior_material', 'warranty', 'airbag', 'air_conditioning',
                  'number_of_seats', 'number_of_doors', 'created_at', 'updated_at', 'user']
