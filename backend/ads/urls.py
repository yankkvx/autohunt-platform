from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdViewSet, FavouriteViewSet

router = DefaultRouter()
router.register('ads', AdViewSet, basename='ads')
router.register('favourites', FavouriteViewSet, basename='favourites')

urlpatterns = [
    path('', include(router.urls)),
]
