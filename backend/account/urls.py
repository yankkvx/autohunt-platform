from django.urls import path
from .views import MyTokenObtainPairView, RegisterView, UserManagement, AdminUserManagement, AdminToggleActive

urlpatterns = [
    path('login/', MyTokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('sign-up/', RegisterView.as_view(), name='sign-up'),
    path('user-management/', UserManagement.as_view(), name='user-management'),
    path('users/', AdminUserManagement.as_view(), name='admin-user-list'),
    path('users/<int:pk>/', AdminUserManagement.as_view(),
         name='admin-user-detail'),
    path('users/<int:pk>/toggle-active/',
         AdminToggleActive.as_view(), name='admin-toggle-active')
]
