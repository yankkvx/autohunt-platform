from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from google.oauth2 import id_token
from google.auth.transport import requests
from .models import User
from .serializers import UserSerializerRefreshToken
import os
from .utils import download_profile_image

GOOGLE_CLIENT_ID = os.getenv('GOOGLE_OAUTH_CLIENT_ID')


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    token = request.data.get('credential')
    account_type = request.data.get('account_type')
    company_name = request.data.get('company_name')

    if not token:
        return Response({'detail': 'No credential provided.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Verify google token and decode userinfo
        id_info = id_token.verify_oauth2_token(
            token, requests.Request(), GOOGLE_CLIENT_ID)

        # Extract fields
        email = id_info.get('email')
        first_name = id_info.get('given_name', '')
        last_name = id_info.get('family_name', '')
        profile_image = id_info.get('picture', '')

        if not email:
            return Response({'detail': 'Email not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Try logging in if user exists
            user = User.objects.get(email=email)

            # Update missings fields if available
            if not user.first_name and first_name:
                user.first_name = first_name
            if not user.last_name and last_name:
                user.last_name = last_name
            user.save()

            # Return token and user info
            serializer = UserSerializerRefreshToken(
                user, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            if not account_type:
                return Response({'detail': 'Account type required for new user.', 'user_info': {
                    'email': email, 'first_name': first_name, 'last_name': last_name, 'profile_image': profile_image
                }}, status=status.HTTP_400_BAD_REQUEST)

            if account_type == 'company' and not company_name:
                return Response({'detail': 'Company name is required for company accounts.'}, status=status.HTTP_400_BAD_REQUEST)

            # Prepare user data for creation user
            user_data = {
                'email': email,
                'username': email,
                'first_name': first_name,
                'last_name': last_name,
                'account_type': account_type,
                'is_active': True,
            }
            if account_type == 'company':
                user_data['company_name'] = company_name

            user = User.objects.create(**user_data)
            user.set_unusable_password()
            user.save()

            # Download profile image if provided
            if profile_image:
                download_profile_image(profile_image, user)
            serializer = UserSerializerRefreshToken(
                user, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    except ValueError as e:
        return Response({'detail': f'Invalid token: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'detail': f'Authentication faile: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
