from rest_framework import serializers
from catalog.serializers import BrandSerializer, ModelCarSerializer, BodyTypeSerializer, FuelTypeSerializer, DriveTypeSerializer, TransmissionSerializer, ColorSerializer, InteriorMaterialSerializer
from catalog.models import Brand, ModelCar, BodyType, FuelType, DriveType, Transmission, Color, InteriorMaterial
from account.serializers import UserBasicSerializer, UserShortSerializer
from .models import Ad, AdImage, Favourite


class AdImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdImage
        fields = ('id', 'image',)


# Main Ad model serializer
class AdSerializer(serializers.ModelSerializer):
    # Nested read-only serializers to display detailed info
    user = UserBasicSerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    model = ModelCarSerializer(read_only=True)
    body_type = BodyTypeSerializer(read_only=True)
    fuel_type = FuelTypeSerializer(read_only=True)
    drive_type = DriveTypeSerializer(read_only=True)
    transmission = TransmissionSerializer(read_only=True)
    interior_color = ColorSerializer(read_only=True)
    exterior_color = ColorSerializer(read_only=True)
    interior_material = InteriorMaterialSerializer(read_only=True)

    # Nested image serializer
    images = AdImageSerializer(many=True, required=False)

    # Write-only fields for creating? updating realtionships using pk
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(), source='brand', write_only=True)
    model_id = serializers.PrimaryKeyRelatedField(
        queryset=ModelCar.objects.all(), source='model', write_only=True)
    body_type_id = serializers.PrimaryKeyRelatedField(
        queryset=BodyType.objects.all(), source='body_type', write_only=True, required=False, allow_null=True)
    fuel_type_id = serializers.PrimaryKeyRelatedField(
        queryset=FuelType.objects.all(), source='fuel_type', write_only=True, required=False, allow_null=True)
    drive_type_id = serializers.PrimaryKeyRelatedField(
        queryset=DriveType.objects.all(), source='drive_type', write_only=True, required=False, allow_null=True)
    transmission_id = serializers.PrimaryKeyRelatedField(
        queryset=Transmission.objects.all(), source='transmission', write_only=True, required=False, allow_null=True)
    exterior_color_id = serializers.PrimaryKeyRelatedField(
        queryset=Color.objects.all(), source='exterior_color', write_only=True, required=False, allow_null=True)
    interior_color_id = serializers.PrimaryKeyRelatedField(
        queryset=Color.objects.all(), source='interior_color', write_only=True, required=False, allow_null=True)
    interior_material_id = serializers.PrimaryKeyRelatedField(
        queryset=InteriorMaterial.objects.all(), source='interior_material', write_only=True, required=False, allow_null=True)

    class Meta:
        model = Ad
        fields = [
            'id', 'user', 'title', 'description', 'brand', 'model', 'body_type', 'fuel_type', 'drive_type',
            'transmission', 'exterior_color', 'interior_color', 'interior_material', 'year', 'mileage', 'power',
            'capacity', 'battery_power', 'battery_capacity', 'price', 'vin', 'location', 'warranty', 'airbag',
            'air_conditioning', 'number_of_seats', 'number_of_doors', 'condition', 'owner_count', 'is_first_owner',
            'created_at', 'updated_at', 'images', 'brand_id', 'model_id', 'body_type_id', 'fuel_type_id',
            'drive_type_id', 'transmission_id', 'exterior_color_id', 'interior_color_id', 'interior_material_id'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


# Less detailed serializer, that optimized for listing Ads
class AdListSerializer(serializers.ModelSerializer):
    # Dispaly fields as string instead of nested objects
    user = UserShortSerializer(read_only=True)
    brand = serializers.StringRelatedField()
    model = serializers.StringRelatedField()
    body_type = serializers.StringRelatedField()
    fuel_type = serializers.StringRelatedField()
    transmission = serializers.StringRelatedField()
    exterior_color = serializers.StringRelatedField()
    images = AdImageSerializer(many=True, read_only=True)

    class Meta:
        model = Ad
        fields = [
            'id', 'title', 'price', 'year', 'mileage', 'user', 'brand', 'model', 'body_type',
            'fuel_type', 'transmission', 'exterior_color', 'condition', 'created_at', 'images'
        ]


class FavouriteSerializer(serializers.ModelSerializer):
    ad = AdListSerializer(read_only=True)

    class Meta:
        model = Favourite
        fields = ['id', 'ad', 'created_at']
        read_only_fields = ['id', 'created_at']
