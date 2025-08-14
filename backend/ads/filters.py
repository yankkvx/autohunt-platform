import django_filters
from .models import Ad, Brand, ModelCar, BodyType, FuelType, DriveType, Transmisson, Color, InteriorMaterial

FOREIGN_FILTERS = {
    'brand': Brand,
    'model': ModelCar,
    'body_type': BodyType,
    'fuel_type': FuelType,
    'drive_type': DriveType,
    'transmisson': Transmisson,
    'exterior_color': Color,
    'interior_color': Color,
    'interior_material': InteriorMaterial
}


class AdFilter(django_filters.FilterSet):
    year_min = django_filters.NumberFilter(
        field_name='year', lookup_expr='gte')
    year_max = django_filters.NumberFilter(
        field_name='year', lookup_expr='lte')
    mileage_min = django_filters.NumberFilter(
        field_name='mileage', lookup_expr='gte')
    mileage_max = django_filters.NumberFilter(
        field_name='mileage', lookup_expr='lte')
    power_min = django_filters.NumberFilter(
        field_name='power', lookup_expr='gte')
    power_max = django_filters.NumberFilter(
        field_name='power', lookup_expr='lte')
    capacity_min = django_filters.NumberFilter(
        field_name='capacity', lookup_expr='gte')
    capacity_max = django_filters.NumberFilter(
        field_name='capacity', lookup_expr='lte')
    battery_power_min = django_filters.NumberFilter(
        field_name='battery_power', lookup_expr='gte')
    battery_power_max = django_filters.NumberFilter(
        field_name='battery_power', lookup_expr='lte')
    battery_capacity_min = django_filters.NumberFilter(
        field_name='battery_capacity', lookup_expr='gte')
    battery_capacity_max = django_filters.NumberFilter(
        field_name='battery_capacity', lookup_expr='lte')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, model_class in FOREIGN_FILTERS.items():
            self.filters[field_name] = django_filters.ModelMultipleChoiceFilter(
                field_name=field_name, queryset=model_class.objects.all())

    class Meta:
        model = Ad
        fields = ['brand', 'model', 'year_min', 'year_max', 'mileage_min', 'mileage_max',
                  'power_min', 'power_max', 'capacity_min', 'capacity_max', 'battery_power_min',
                  'battery_power_max', 'battery_capacity_min', 'battery_capacity_max',
                  'fuel_type', 'body_type', 'drive_type', 'transmisson', 'exterior_color',
                  'interior_color', 'interior_material', 'warranty', 'airbag',
                  'air_conditioning', 'number_of_seats', 'number_of_doors']
