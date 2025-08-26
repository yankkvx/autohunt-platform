from django.urls import path
from .views import MyTokenObtainPairView, RegisterView

urlpatterns = [
    path('login/', MyTokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('sign-up/', RegisterView.as_view(), name='sign-up'),
]
