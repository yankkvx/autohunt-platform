from django.urls import path
from .views import MyTokenObtainPairView, RegisterView, UserManagement, AdminUserManagement, AdminToggleActive, AdminToggleStaff, PublicProfie

urlpatterns = [
    path('login/', MyTokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('sign-up/', RegisterView.as_view(), name='sign-up'),
    path('user-management/', UserManagement.as_view(), name='user-management'),
    path('admin/users/', AdminUserManagement.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', AdminUserManagement.as_view(),
         name='admin-user-detail'),
    path('admin/users/<int:pk>/toggle-active/',
         AdminToggleActive.as_view(), name='admin-toggle-active'),
    path('admin/users/<int:pk>/toggle-staff/',
         AdminToggleStaff.as_view(), name='admin-toggle-staff'),
    path('profile/<int:pk>/', PublicProfie.as_view(), name='public-profile'),
]
