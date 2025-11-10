from rest_framework import viewsets, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404
from .models import Ad, AdImage, Favourite
from .serializers import AdSerializer, AdListSerializer, AdImageSerializer, FavouriteSerializer
from .filters import AdFilter
from .utils import validate_image_file
from .tasks import process_image_watermark
from .pagination import AdPagination
from account.throttles import CreateAdThrottle, UploadThrottle
from subscription.utils import can_user_create_ad, get_user_ad_stats
from .location_service import LocationService


@api_view(['GET'])
@permission_classes([AllowAny])
def search_location(request):
    query = request.query_params.get('q', '')

    if not query or len(query) < 3:
        return Response({'results': []})

    results = LocationService.search_location(query=query, limit=10)
    return Response({'results': results})


@api_view(['GET'])
@permission_classes([AllowAny])
def reverse_geocode(request):
    try:
        lat = float(request.query_params.get('lat'))
        lon = float(request.query_params.get('lon'))

        if not LocationService.validate_coordinates(lat, lon):
            return Response({'detail': 'Invalid coordinates'}, status=status.HTTP_400_BAD_REQUEST)

        result = LocationService.reverse_geocode(lat, lon)

        if result:
            return Response(result)
        return Response({'detail': 'Location not fount.'}, status=status.HTTP_404_NOT_FOUND)

    except (ValueError, TypeError):
        return Response({'detail': 'Invalid parametes'}, status=status.HTTP_400_BAD_REQUEST)


class AdViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Ads
    Supports crud operations with filtering, searching and ordering
    Includes some custom actions for recent ads, image upload, etc
    """
    # Base queryset for all actions
    queryset = Ad.objects.all()
    pagination_class = AdPagination

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = AdFilter
    search_fields = ['title', 'description',
                     'brand__name', 'model__name', 'location']
    ordering_fields = ['price', 'year', 'mileage', 'created_at']
    ordering = ['-created_at']

    # Dynamicly choose serializer depending on action
    def get_serializer_class(self):
        if self.action == 'list':
            # Lighter serializer for listing (less data, faster)
            return AdListSerializer
        else:
            return AdSerializer

    # Dynamicly choose permissions per action
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'add_image', 'remove_image']:
            # Only authenticated users can modify ads
            return [IsAuthenticated()]
        else:
            return [AllowAny()]

    def get_throttles(self):
        if self.action == 'create':
            return [CreateAdThrottle()]
        elif self.action == 'add_image':
            return [UploadThrottle()]
        return super().get_throttles()

    # Helper methot to ensure that only owner of Ad can modify it
    def check_ownership(self, ad):
        if not self.request.user.is_staff and ad.user != self.request.user:
            raise PermissionDenied('You can modify only your own ads.')

    def perform_create(self, serializer):
        user = self.request.user
        if not can_user_create_ad(user):
            stats = get_user_ad_stats(user)
            raise PermissionDenied(
                f'Ad limit reached. You have {stats["usage"]}/{stats["limit"]} ads. '
                f'{"Purchase a subscription plan to get more ad slots." if user.account_type == "company" else "Please delete an ad to create a new one."}'
            )
        ad = serializer.save(user=user)
        location_str = self.request.data.get('location')
        if location_str:
            geocode_results = LocationService.search_location(
                location_str, limit=1)
            if geocode_results:
                ad.set_location_from_geocode(geocode_results[0])
                ad.save()

    def perform_update(self, serializer):
        ad = self.get_object()
        self.check_ownership(ad)
        serializer.save()

    def perform_destroy(self, instance):
        self.check_ownership(instance)
        instance.delete()

    # Custom action, that return 10 most recent ads
    @action(detail=False, methods=['get'])
    def recent_ads(self, request):
        queryset = self.get_queryset().order_by('-created_at')[:10]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def my_stats(self, request):
        user = self.request.user
        if not user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
        stats = get_user_ad_stats(user)
        return Response(stats, status=status.HTTP_200_OK)

    # Custom action, that allow adding multiple images to ad
    @action(detail=True, methods=['post'])
    def add_image(self, request, pk=None):
        ad = self.get_object()
        self.check_ownership(ad)
        images = request.FILES.getlist('images')
        if not images:
            return Response({'detail': 'No images provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate images
        for img in images:
            is_valid, error_message = validate_image_file(img)
            if not is_valid:
                return Response(
                    {'detail': f'Invalid image {img.name}: {error_message}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Bulk create Adimage instances
        images_data = [{'image': img} for img in images]
        serializer = AdImageSerializer(data=images_data, many=True)
        serializer.is_valid(raise_exception=True)
        created_images = serializer.save(ad=ad)

        image_ids = [img.id for img in created_images]

        # Async watermark process for each image
        for image_id in image_ids:
            try:
                result = process_image_watermark.delay(
                    image_id, 'AutoHunt', 0.7)
                print(
                    f'Task sent to celery for image {image_id}, task ID: {result.id}')

            except Exception as e:
                print(f'An error occured during sending task to celery: {e}')
        return Response({
            'images': serializer.data,
            'message': 'Images were uploaded. The watermark process started in the background mode.'
        }, status=status.HTTP_201_CREATED)

        # new_images = []
        # for image in images:
        #     serializer = AdImageSerializer(data={'image': image})
        #     serializer.is_valid(raise_exception=True)
        #     serializer.save(ad=ad)
        #     new_images.append(serializer.data)
        # return Response(new_images, status=status.HTTP_201_CREATED)

    # Custom action for delete a specific image
    @action(detail=True, methods=['delete'])
    def remove_image(self, request, pk=None):
        ad = self.get_object()
        self.check_ownership(ad)

        image_id = request.data.get('image_id')
        if not image_id:
            return Response({'detail': 'image_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        image = get_object_or_404(AdImage, id=image_id, ad=ad)
        image.delete()
        return Response({'detail': 'Image was successfully deleted.'}, status=status.HTTP_204_NO_CONTENT)


class FavouriteViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    pagination_class = AdPagination

    def list(self, request):

        favourites = Favourite.objects.filter(user=request.user).select_related(
            'ad__user', 'ad__brand', 'ad__model', 'ad__body_type',
            'ad__fuel_type', 'ad__transmission', 'ad__exterior_color'
        ).prefetch_related('ad__images')

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(favourites, request)

        if page is not None:
            serializer = FavouriteSerializer(
                page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)

    def create(self, request):
        ad_id = request.data.get('ad_id')
        if not ad_id:
            return Response({'detail': 'ad_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        ad = get_object_or_404(Ad, id=ad_id)

        if ad.user == request.user:
            return Response({'detail': "You cannot add your own ad to favourites."}, status=status.HTTP_400_BAD_REQUEST)

        if Favourite.objects.filter(ad=ad, user=request.user).exists():
            return Response({'detail': 'Ad is already in favourites.'}, status=status.HTTP_409_CONFLICT)

        favourite = Favourite.objects.create(ad=ad, user=request.user)
        serializer = FavouriteSerializer(
            favourite, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        ad = get_object_or_404(Ad, id=pk)
        favourite = get_object_or_404(Favourite, ad=ad, user=request.user)
        favourite.delete()
        return Response({'detail': 'Ad removed from favourites'}, status=status.HTTP_204_NO_CONTENT)
