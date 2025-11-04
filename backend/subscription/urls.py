from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubscriptionPlanViewSet, UserSubscriptionViewSet

router = DefaultRouter()
router.register('plans', SubscriptionPlanViewSet, basename='subscription-plan')
router.register('my-subscriptions', UserSubscriptionViewSet,
                basename='user-subscriptions')

urlpatterns = [
    path('subscriptions/', include(router.urls))
]
