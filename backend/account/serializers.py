from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
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


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration with validation"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['account_type', 'first_name', 'last_name', 'email',
                  'phone_number', 'company_name', 'password', 'password_confirm']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'phone_number': {'required': True},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError(
                'User with this email aready exists.')
        return value.lower()

    def validate_phone_number(self, value):
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError(
                'User with this phone number already exists.')
        return value

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attrs):
        password_confirm = attrs.pop('password_confirm', None)
        if password_confirm and attrs['password'] != password_confirm:
            raise serializers.ValidationError({
                'details': 'Passwords do not match.'
            })

        account_type = attrs.get('account_type', User.ACCOUNT_PRIVATE)
        company_name = attrs.get('company_name')

        if account_type == User.ACCOUNT_COMPANY and not company_name:
            raise serializers.ValidationError({
                'details': 'Company name is required for company accounts.'
            })
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')

        validated_data['username'] = validated_data['email']

        if validated_data.get('account_type') != User.ACCOUNT_COMPANY:
            validated_data.pop('company_name', None)

        user = User.objects.create_user(
            password=password, **validated_data)

        return user


class UpdateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=False,
        style={'input_type': 'password'})
    profile_image = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone_number', 'about', 'profile_image', 'telegram',
                  'twitter', 'instagram', 'company_name', 'company_website', 'company_office', 'password']

    def validate_phone_number(self, value):
        user = self.instance
        if user and User.objects.filter(phone_number=value).exclude(id=user.id).exists():
            raise serializers.ValidationError(
                'User with this phone number already exists.'
            )

    def validate_password(self, value):
        if value:
            try:
                validate_password(value)
            except DjangoValidationError as e:
                raise serializers.ValidationError(list(e.messages))
        return value

    def validate_company(self, attrs):
        user = self.instance

        if user and user.account_type != User.ACCOUNT_COMPANY:
            attrs.pop('company_name', None)
            attrs.pop('company_website', None)
            attrs.pop('company_office', None)

        return attrs

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        profile_image = self.context.get('request').FILES.get('profile_image')
        if profile_image:
            validated_data['profile_image'] = profile_image

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance


class DeleteAccountSerializer(serializers.Serializer):
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        serializer = UserSerializerRefreshToken(self.user).data
        for k, v in serializer.items():
            data[k] = v
        return data
