from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.shortcuts import get_object_or_404

from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from django.db import transaction, IntegrityError
from .serializers import (UserSerializer, RegisterSerializer,
                          UpdateUserSerializer, DeleteAccountSerializer,
                          UserSerializerRefreshToken, MyTokenObtainPairSerializer)
from .throttles import AuthThrottle, RegisterThrottle


# Custom JWT token view using serializer
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    permission_classes = [AllowAny]
    throttle_classes = [AuthThrottle]


class RegisterView(APIView):
    """
    API endpoint for registering a new user
    """

    permission_classes = [AllowAny]
    throttle_classes = [RegisterThrottle]

    def post(self, request):

        serializer = RegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                user = serializer.save()

                response_serializer = UserSerializerRefreshToken(user)

                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except IntegrityError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': 'Registration failed.'}, status=status.HTTP_400_BAD_REQUEST)


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
            serializer = UserSerializer(
                user, many=False, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': 'Failed to retrieve profile.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request):
        """
        Update the authenticated users profile
        - Supports updating personal information
        - Supports updationg profile image
        - For company accounts, allows updating company details
        - If password is provided, it will be hashed.
        """
        user = request.user
        serializer = UpdateUserSerializer(
            user, data=request.data, partial=True, context={'request': request})

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                serializer.save()
                response_serializer = UserSerializerRefreshToken(user)
                return Response(response_serializer.data, status=status.HTTP_200_OK)
        except IntegrityError as e:
            return Response({'detail': 'Phone number alredy exists.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': 'Failed to update profile.'}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        """
        Delete the authenticated users account
        Requires the correct password for confirmation/
        """
        user = request.user
        data = request.data
        serializer = DeleteAccountSerializer(data=data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        password = serializer.validated_data['password']

        if not user.check_password(password):
            return Response({'detail': 'Incorrect password'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user.delete()
            return Response({'detail': 'Account successfully deleted.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': 'Failed to delete account.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PublicProfie(APIView):
    """
    API ednpoint for getting public information about user.
    Available to everyone (authorized and unauthorized)
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            user = get_object_or_404(User, id=pk)
            if not user.is_active:
                return Response({'detail': 'This profile is not available.'}, status=status.HTTP_404_NOT_FOUND)
            serializer = UserSerializer(
                user, many=False, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': 'Profile upload failed'}, status=status.HTTP_400_BAD_REQUEST)


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
        try:
            if pk:
                user = get_object_or_404(User, id=pk)
                serializer = UserSerializer(user, many=False)
            else:
                queryset = User.objects.all()

                account_type = request.query_params.get('account_type')
                if account_type:
                    queryset = queryset.filter(account_type=account_type)

                is_active = request.query_params.get('is_active')
                if is_active is not None:
                    queryset = queryset.filter(
                        is_active=is_active.lower() == 'true')

                search = request.query_params.get('search')
                if search:
                    queryset = queryset.filter(email__icontains=search) | queryset.filter(
                        first_name__icontains=search) | queryset.filter(last_name__icontains=search)

                serializer = UserSerializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'detail': 'Failed to retrieve users.'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, pk):
        """
        Update user information, including optional password and image
        """
        user = get_object_or_404(User, id=pk)
        serializer = UpdateUserSerializer(
            user, data=request.data, partial=True, context={'request': request})

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                serializer.save()
            response_serializer = UserSerializerRefreshToken(user)

            return Response(response_serializer.data, status=status.HTTP_200_OK)
        except IntegrityError as e:
            return Response({'detail': 'Email or phone number already exists.'},
                            status=status.HTTP_400_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'detail': 'Failed to update user.'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk):
        """
        Delete a user by ID
        """
        try:
            user = get_object_or_404(User, id=pk)
            user.delete()

            return Response({'detail': 'User successfully deleted.'},
                            status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': 'Failed to delete user.'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminToggleActive(APIView):
    """Admin API endpoint for ban/unbanned user"""
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            user = get_object_or_404(User, id=pk)
            user.is_active = not user.is_active
            user.save(update_fields=['is_active'])

            return Response({'detail': f"User {'unbanned' if user.is_active else 'banned'}.",
                             'is_active': user.is_active}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': 'Failed to update user status.'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminToggleStaff(APIView):
    """Admin API endpoint for granting/reviking staff status"""
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            user = get_object_or_404(User, id=pk)
            if user.id == request.user.id:
                return Response({'detail': 'You cannot change your own staff status.'}, status=status.HTTP_400_BAD_REQUEST)

            user.is_staff = not user.is_staff
            user.save(update_fields=['is_staff'])

            return Response({'detail': f"User {'granted' if user.is_staff else 'revoked'} staff status.", 'is_staff': user.is_staff}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': 'Failed to update user staff status.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
