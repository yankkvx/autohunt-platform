from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
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
                username=email,  # Email as username
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


class UserManagement(APIView):
    """
    API endpoint for managing authenticated user accounts.
    Supports retrieving, updating and deleting the users profile
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve the authenticated user prifles.
        """
        try:
            user = request.user
            serializer = UserSerializer(user, many=False)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': f'An error occured during getting enformation: {e}.'}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        """
        Update the authenticated users profile
        - Supports updating personal information
        - Supports updationg profile image
        - For company accounts, allows updating company details
        - If password is provided, it will be hashed.
        """
        user = request.user
        data = request.data
        try:
            # Update common profile fields
            user.first_name = data.get('first_name', user.first_name)
            user.last_name = data.get('last_name', user.last_name)
            user.phone_number = data.get('phone_number', user.phone_number)
            user.about = data.get('about', user.about)
            user.telegram = data.get('telegram', user.telegram)
            user.twitter = data.get('twitter', user.twitter)
            user.instagram = data.get('instagram', user.instagram)

            profile_image = request.FILES.get('profile_image')
            if profile_image:
                user.profile_image = profile_image

            # Extra field only for company accounts
            if user.account_type == User.ACCOUNT_COMPANY:
                user.company_name = data.get('company_name', user.company_name)
                user.company_website = data.get(
                    'company_website', user.company_website)
                user.company_office = data.get(
                    'company_office', user.company_office)

            # If new password is provided hast it before saving
            if data.get('password'):
                user.password = make_password(data['password'])

            user.save()
            serializer = UserSerializerRefreshToken(user, many=False)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': f'An error occured during updating information: {e}.'}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        """
        Delete the authenticated users account
        Requires the correct password for confirmation/
        """
        user = request.user
        password = request.data.get('password')

        # Ensure password is provided
        if not password:
            return Response({'detail': 'Password is required to delete account.'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify password before deleting
        if not user.check_password(password):
            return Response({'detail': 'Incorrect password.'}, status=status.HTTP_400_BAD_REQUEST)

        user.delete()
        return Response({'detail': 'User was deleted.'}, status=status.HTTP_200_OK)


class AdminUserManagement(APIView):
    """
    Admin API for managing users: retieve, update, delete
    """

    permission_classes = [IsAdminUser]

    def get(self, request, pk=None):
        """
        Retreive user(s) information
        GET /users/ - list all users
        GET /user/<pk>/ - retrieve specific user
        """
        if pk:
            user = get_object_or_404(User, id=pk)
            serializer = UserSerializer(user, many=False)
        else:
            users = User.objects.all()
            serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        """
        Update user information, including optional password and image
        """
        user = get_object_or_404(User, id=pk)
        data = request.data

        # Update common profile fields
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.phone_number = data.get('phone_number', user.phone_number)
        user.about = data.get('about', user.about)
        user.telegram = data.get('telegram', user.telegram)
        user.twitter = data.get('twitter', user.twitter)
        user.instagram = data.get('instagram', user.instagram)

        profile_image = request.FILES.get('profile_image')
        if profile_image:
            user.profile_image = profile_image

        # Extra field only for company accounts
        if user.account_type == User.ACCOUNT_COMPANY:
            user.company_name = data.get('company_name', user.company_name)
            user.company_website = data.get(
                'company_website', user.company_website)
            user.company_office = data.get(
                'company_office', user.company_office)

        # If new password is provided hast it before saving
        if data.get('password'):
            user.password = make_password(data['password'])

        user.save()
        serializer = UserSerializerRefreshToken(user, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        """
        Delete a user by ID
        """
        user = get_object_or_404(User, id=pk)
        user.delete()
        return Response({'detail': 'User was deleted.'}, status=status.HTTP_200_OK)
