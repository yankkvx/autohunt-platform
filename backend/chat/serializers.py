from rest_framework import serializers
from .models import Chat, Message
from account.serializers import UserBasicSerializer
from ads.serializers import AdListSerializer


class MessageSerializer(serializers.ModelSerializer):
    sender = UserBasicSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'content', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'created_at']


class ChatSerializer(serializers.ModelSerializer):
    buyer = UserBasicSerializer(read_only=True)
    seller = UserBasicSerializer(read_only=True)
    ad = AdListSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    other_user = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ['id', 'ad', 'buyer', 'seller', 'other_user',
                  'last_message', 'unread_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return {
                'content': last_msg.content,
                'sender_id': last_msg.sender.id,
                'created_at': last_msg.created_at
            }
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0

    def get_other_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            other_user = obj.get_other_user(request.user)
            return UserBasicSerializer(other_user,  context={'request': request}).data
        return None


class ChatDetailSerializer(serializers.ModelSerializer):
    buyer = UserBasicSerializer(read_only=True)
    seller = UserBasicSerializer(read_only=True)
    ad = AdListSerializer(read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    other_user = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ['id', 'ad', 'buyer', 'seller', 'other_user',
                  'messages', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_other_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            other_user = obj.get_other_user(request.user)
            return UserBasicSerializer(other_user, context={'request': request}).data
        return None
