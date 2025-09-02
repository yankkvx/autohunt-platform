from rest_framework import viewsets, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404
from .models import Ad, AdImage
from .serializers import AdSerializer, AdListSerializer, AdImageSerializer
from .filters import AdFilter


class AdViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Ads
    Supports crud operations with filtering, searching and ordering
    Includes some custom actions for recent ads, image upload, etc
    """
    # Base queryset for all actions
    queryset = Ad.objects.all()

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

    # Helper methot to ensure that only owner of Ad can modify it
    def check_ownership(self, ad):
        if ad.user != self.request.user:
            raise PermissionDenied('You can modify only your own ads.')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

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

    # Custom action, that allow adding multiple images to ad
    @action(detail=True, methods=['post'])
    def add_image(self, request, pk=None):
        ad = self.get_object()
        self.check_ownership(ad)
        images = request.FILES.getlist('images')
        if not images:
            return Response({'detail': 'No images provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Bulk create Adimage instances
        images_data = [{'image': img} for img in images]
        serializer = AdImageSerializer(data=images_data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(ad=ad)  # associate new images with current ad
        return Response(serializer.data, status=status.HTTP_201_CREATED)

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
