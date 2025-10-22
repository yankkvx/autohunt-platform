from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Chat, Message

User = get_user_model()


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.chat_group_name = f'chat_{self.chat_id}'
        self.user = self.scope['user']

        if not self.user.is_authenticated:
            await self.close()
            return

        if not await self.is_chat_participant():
            await self.close()
            return

        await self.channel_layer.group_add(self.chat_group_name, self.channel_name)
        await self.accept()
        await self.send_json({
            'type': 'connection_established',
            'message': 'Connected to chat'
        })

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.chat_group_name, self.channel_name)

    async def receive_json(self, content):
        try:
            message_type = content.get('type', 'chat_message')

            if message_type == 'chat_message':
                text = content.get('message', '').strip()
                if not text:
                    await self.send_json({'type': 'error', 'message': 'Message cannot be empty'})
                    return

                message = await self.save_message(text)
                await self.channel_layer.group_send(
                    self.chat_group_name,
                    {
                        'type': 'chat_message',
                        'message': {
                            'id': message.id,
                            'content': message.content,
                            'sender': {
                                'id': message.sender.id,
                                'first_name': message.sender.first_name,
                                'last_name': message.sender.last_name,
                                'email': message.sender.email,
                                'profile_image': message.sender.profile_image.url if message.sender.profile_image else None,
                            },
                            'is_read': message.is_read,
                            'created_at': message.created_at.isoformat()
                        }
                    }
                )

            elif message_type == 'mark_read':
                await self.mark_messages_as_read()
                await self.channel_layer.group_send(
                    self.chat_group_name,
                    {
                        'type': 'mark_read',   # must match method name below
                        'user_id': self.user.id
                    }
                )

        except Exception as e:
            await self.send_json({'type': 'error', 'message': str(e)})

    async def chat_message(self, event):
        await self.send_json({
            'type': 'chat_message',
            'message': event['message']
        })

    async def mark_read(self, event):
        """Handler for read receipts"""
        await self.send_json({
            'type': 'mark_read',
            'user_id': event['user_id']
        })

    @database_sync_to_async
    def is_chat_participant(self):
        try:
            chat = Chat.objects.get(id=self.chat_id)
            return self.user == chat.buyer or self.user == chat.seller
        except Chat.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content):
        chat = Chat.objects.get(id=self.chat_id)
        message = Message.objects.create(
            chat=chat, sender=self.user, content=content)
        chat.save()
        return message

    @database_sync_to_async
    def mark_messages_as_read(self):
        Message.objects.filter(chat_id=self.chat_id, is_read=False).exclude(
            sender=self.user).update(is_read=True)
