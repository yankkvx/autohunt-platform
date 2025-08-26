from django.urls import path
from .views import MyTokenObtainPairView, RegisterView, UserManagement

urlpatterns = [
    path('login/', MyTokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('sign-up/', RegisterView.as_view(), name='sign-up'),
    path('user-management/', UserManagement.as_view(), name='user-management'),
]
