from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema, OpenApiExample, OpenApiResponse
from .serializers import AdSerializer
from .filters import AdFilter

ad_list_create_get = extend_schema(
    summary='List advertisements',
    description=(
        'Retrieve a list of advertisements. Supports filtering by multiple parameters '
        'such as brand, model, year range, power, capacity, etc. Returns all ads if no filters are applied'
    ),
    parameters=[
        OpenApiParameter(
            name=param_name,
            description=f'Filter by {param_name}',
            required=False,
            type=str
        ) for param_name in AdFilter.get_filters()
    ],
    responses={200: AdSerializer(many=True)},
    examples=[
        OpenApiExample(
            'Expample with brand filter',
            summary='Filter ads by brand',
            value={'brand': 1},
        ),
        OpenApiExample(
            'Example with year range',
            summary='Filter ads by year range',
            value={'year_min': 2000, 'year_max': 2015}
        ),
    ],
)


ad_list_create_post = extend_schema(
    summary='Create a new AD',
    description=(
        'Create a new advertisement. Requires authentication. '
        'The ad will be automatically assigned to the currently authenticated user.'
    ),
    request=AdSerializer,
    responses={
        201: AdSerializer,
        400: OpenApiResponse(
            response=OpenApiTypes.OBJECT,
            description='Validation error details'
        )
    },
    examples=[
        OpenApiExample(
            'Basic ad creation',
            value={
                'brand': 1,
                'model': 5,
                'year': 2022,
                'mileage': 15000,
                'description': 'Great condition, low mileage'
            }
        )
    ]
)

ad_details_get = extend_schema(
    summary='Retrieve advertisement details',
    description='Get a single advertisement by id (pk)',
    responses={
        200: AdSerializer,
        404: OpenApiExample(
            'Not found', value={'detail': 'Not found'}
        )
    }
)


ad_details_put = extend_schema(
    summary='Update and advertisement',
    description='Update an advertisement by its ID. Requires authentication and ownership of the advertisement',
    request=AdSerializer,
    responses={
        200: AdSerializer,
        400: OpenApiExample('Invalid data', value={'detail': 'Validation error details'}),
        403: OpenApiExample('Forbidden', value={'detail': 'Not allowed'}),
        404: OpenApiExample('Not found', value={'detail': 'Not found'})
    }
)


ad_details_delete = extend_schema(
    summary='Delete an advertisement',
    description='Delete an advertisement by its ID. Requires authentication and ownership of the advertisement',
    responses={
        204: None,
        403: OpenApiExample('Forbidden', value={'detail': 'Not allowed'}),
        404: OpenApiExample('Not found', value={'detail': 'Not found'})
    }
)
