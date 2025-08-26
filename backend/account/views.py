from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import UserSerializer, UserSerializerRefreshToken, MyTokenObtainPairSerializer


# Custom JWT token view using serializer
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class RegisterView(APIView):
    """
    API endpoint for registering a new user
    """

    def post(self, request):
        data = request.data

        # Extract mandatory fields
        email = data['email']
        password = data['password']
        account_type = data.get('account_type', User.ACCOUNT_PRIVATE)

        # Check if a user with the same email already exists
        if User.objects.filter(email=data['email']).exists():
            return Response({'detail': 'User with this email is already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        # Check of a user with the same phone number is aready exists
        if User.objects.filter(phone_number=data['phone_number']).exists():
            return Response({'detail': 'User with this phone number is already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Create a new user using the create_user helper (handles password hashing)
            user = User.objects.create_user(
                email=email,
                username=email, # Email as username
                password=password,
                account_type=account_type,
                first_name=data['first_name'],
                last_name=data['last_name'],
                phone_number=data['phone_number'],
                company_name=data['company_name'] if account_type == User.ACCOUNT_COMPANY else None
            )
            serializer = UserSerializerRefreshToken(user, many=False)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
