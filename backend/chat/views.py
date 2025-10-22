from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Chat, Message
from ads.models import Ad
from .serializers import ChatSerializer, ChatDetailSerializer, MessageSerializer


class ChatViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ChatSerializer

    def get_queryset(self):
        user = self.request.user
        return Chat.objects.filter(Q(buyer=user) | Q(seller=user)).select_related('ad', 'buyer', 'seller').prefetch_related('messages')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ChatDetailSerializer
        return ChatSerializer

    @action(detail=False, methods=['post'])
    def get_or_create(self, request):
        ad_id = request.data.get('ad_id')
        if not ad_id:
            return Response({'detail': 'ad_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        ad = get_object_or_404(Ad, id=ad_id)
        buyer = request.user
        seller = ad.user

        if buyer == seller:
            return Response({'detail': 'You cannot chat with yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        chat, created = Chat.objects.get_or_create(
            ad=ad, buyer=buyer, seller=seller)
        serializer = ChatDetailSerializer(chat, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        chat = self.get_object()

        Message.objects.filter(chat=chat, is_read=False).exclude(
            sender=request.user).update(is_read=True)
        return Response({'detail': 'Messages marked as read.'}, status=status.HTTP_200_OK)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        Message.objects.filter(chat=instance, is_read=False).exclude(
            sender=request.user).update(is_read=True)

        serializer = self.get_serializer(instance)
        return Response(serializer.data)
