from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdViewSet, FavouriteViewSet, search_location, reverse_geocode

router = DefaultRouter()
router.register('ads', AdViewSet, basename='ads')
router.register('favourites', FavouriteViewSet, basename='favourites')

urlpatterns = [
    path('', include(router.urls)),
    path('locations/search/', search_location, name='search-location'),
    path('locations/reverse/', reverse_geocode, name='reverse-geocode')
]
