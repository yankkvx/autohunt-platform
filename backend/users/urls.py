from django.urls import path
from .views import UserManagement, UserDetails

urlpatterns = [
    path('users/', UserManagement.as_view(), name='user-management'),
    path('users/<int:pk>/', UserDetails.as_view(), name='user-details')
]