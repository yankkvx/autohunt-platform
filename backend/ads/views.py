from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Ad
from .serializers import AdSerializer, AdWriteSerializer
from .filters import AdFilter
from .schema import ad_list_create_get, ad_list_create_post, ad_details_get, ad_details_put, ad_details_delete


class AdListCreateView(APIView):
    @ad_list_create_get
    def get(self, request):
        queryset = Ad.objects.all()
        filterset = AdFilter(request.GET, queryset=queryset)
        if filterset.is_valid():
            queryset = filterset.qs
        serializer = AdSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @ad_list_create_post
    def post(self, request):
        serializer = AdSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdDetailView(APIView):
    @ad_details_get
    def get(self, request, pk):
        ad = get_object_or_404(Ad, pk=pk)
        serializer = AdSerializer(ad, many=False)
        return Response(serializer.data)

    @ad_details_put
    def put(self, request, pk):
        ad = get_object_or_404(Ad, pk=pk)
        if ad.user != request.user:
            return Response({'detail': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)
        serializer = AdWriteSerializer(ad, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @ad_details_delete
    def delete(self, request, pk):
        ad = get_object_or_404(Ad, pk=pk)
        if ad.user != request.user:
            return Response({'detail': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)
        else:
            ad.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
