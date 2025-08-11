from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password
from .serializers import UserSerializer
from .schema import user_management_get, user_management_post, user_details_get, user_details_put, user_details_delete


class UserManagement(APIView):
    @user_management_get
    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    @user_management_post
    def post(self, request):
        user = request.data
        serializer = UserSerializer(data=user)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetails(APIView):
    @user_details_get
    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = UserSerializer(user, many=False)
        return Response(serializer.data)

    @user_details_put
    def put(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        data = request.data.copy()
        if 'password' in data:
            data['password'] = make_password(data['password'])
        serializer = UserSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        print(serializer.errors, flush=True)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @user_details_delete
    def delete(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
