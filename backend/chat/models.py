from django.db import models
from django.conf import settings
from ads.models import Ad
# Create your models here.


class Chat(models.Model):
    ad = models.ForeignKey(Ad, on_delete=models.CASCADE, related_name='chats')
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='buyer_chats')
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='seller_chats')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('ad', 'buyer', 'seller')
        ordering = ['-updated_at']

    def __str__(self):
        return f'Chat {self.id}: Buyer: {self.buyer.email} -> Seller: {self.seller.email} (Ad #{self.ad.id})'

    def get_other_user(self, user):
        if user == self.buyer:
            return self.seller
        return self.buyer


class Message(models.Model):
    chat = models.ForeignKey(
        Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField(max_length=2500)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Message {self.id} from {self.sender.email} in chat {self.chat.id}'
