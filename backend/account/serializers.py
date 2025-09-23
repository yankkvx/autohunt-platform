from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'account_type', 'phone_number', 'first_name',
                  'last_name', 'about', 'profile_image', 'telegram', 'twitter',
                  'instagram', 'company_name', 'company_website', 'company_office',
                  'is_active', 'is_staff']


class UserShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'account_type', 'first_name', 'company_name']


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'account_type', 'first_name', 'last_name',
                  'company_name', 'email', 'phone_number', 'profile_image']


class UserSerializerRefreshToken(UserSerializer):
    token = serializers.SerializerMethodField(read_only=True)

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['token']

    def get_token(self, obj):
        token = RefreshToken.for_user(obj)
        return str(token.access_token)


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        serializer = UserSerializerRefreshToken(self.user).data
        for k, v in serializer.items():
            data[k] = v
        return data
