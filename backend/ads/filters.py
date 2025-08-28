import django_filters
from .models import Ad
from catalog.models import Brand, ModelCar, BodyType, FuelType, DriveType, Transmission, Color, InteriorMaterial

FOREIGN_FILTERS = {
    'brand': Brand,
    'model': ModelCar,
    'body_type': BodyType,
    'fuel_type': FuelType,
    'drive_type': DriveType,
    'transmission': Transmission,
    'exterior_color': Color,
    'interior_color': Color,
    'interior_material': InteriorMaterial,
}


class AdFilter(django_filters.FilterSet):
    # Ranges for the numeric fields
    year_min = django_filters.NumberFilter(field_name='year', lookup_expr='gte')
    year_max = django_filters.NumberFilter(field_name='year', lookup_expr='lte')
    price_min = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    price_max = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    mileage_min = django_filters.NumberFilter(field_name='mileage', lookup_expr='gte')
    mileage_max = django_filters.NumberFilter(field_name='mileage', lookup_expr='lte')
    power_min = django_filters.NumberFilter(field_name='power', lookup_expr='gte')
    power_max = django_filters.NumberFilter(field_name='power', lookup_expr='lte')
    capacity_min = django_filters.NumberFilter(field_name='capacity', lookup_expr='gte')
    capacity_max = django_filters.NumberFilter(field_name='capacity', lookup_expr='lte')
    battery_power_min = django_filters.NumberFilter(field_name='battery_power', lookup_expr='gte')
    battery_power_max = django_filters.NumberFilter(field_name='battery_power', lookup_expr='lte')
    battery_capacity_min = django_filters.NumberFilter(field_name='battery_capacity', lookup_expr='gte')
    battery_capacity_max = django_filters.NumberFilter(field_name='battery_capacity', lookup_expr='lte')
    number_of_seats_min = django_filters.NumberFilter(field_name='number_of_seats', lookup_expr='gte')
    number_of_seats_max = django_filters.NumberFilter(field_name='number_of_seats', lookup_expr='lte')
    number_of_doors_min = django_filters.NumberFilter(field_name='number_of_doors', lookup_expr='gte')
    number_of_doors_max = django_filters.NumberFilter(field_name='number_of_doors', lookup_expr='lte')
    owner_count_min = django_filters.NumberFilter(field_name='owner_count', lookup_expr='gte')
    owner_count_max = django_filters.NumberFilter(field_name='owner_count', lookup_expr='lte')

    # Boolean filters
    warranty = django_filters.BooleanFilter(field_name='warranty')
    airbag = django_filters.BooleanFilter(field_name='airbag')
    air_conditioning = django_filters.BooleanFilter(
        field_name='air_conditioning')
    is_first_owner = django_filters.BooleanFilter(field_name='is_first_owner')

    # Multiple choices filter for ForeignKey from catalog

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, model_class in FOREIGN_FILTERS.items():
            self.filters[field_name] = django_filters.ModelMultipleChoiceFilter(
                field_name=field_name, queryset=model_class.objects.all())

    class Meta:
        model = Ad
        fields = [
            'brand', 'model', 'year_min', 'year_max', 'mileage_min', 'mileage_max',
            'power_min', 'power_max', 'capacity_min', 'capacity_max',
            'battery_power_min', 'battery_power_max', 'battery_capacity_min', 'battery_capacity_max',
            'fuel_type', 'body_type', 'drive_type', 'transmission', 'exterior_color',
            'interior_color', 'interior_material', 'warranty', 'airbag', 'air_conditioning',
            'is_first_owner', 'number_of_seats_min', 'number_of_seats_max',
            'number_of_doors_min', 'number_of_doors_max', 'owner_count_min', 'owner_count_max',
            'condition', 'price_min', 'price_max'
        ]
