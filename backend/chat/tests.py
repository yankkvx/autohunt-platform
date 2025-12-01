from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from decimal import Decimal
from .models import Chat, Message
from ads.models import Ad
from catalog.models import Brand, ModelCar

User = get_user_model()


class ChatModelTests(TestCase):
    """Test cases for Chat model"""

    def setUp(self):
        self.seller = User.objects.create(
            email='seller@email.com',
            username='seller@email.com',
            password='321qwerty',
            first_name='Seller',
            last_name='User',
            phone_number='+1234567890'
        )

        self.buyer = User.objects.create(
            email='buyer@email.com',
            username='buyer@email.com',
            password='321qwerty',
            first_name='Buyer',
            last_name='User',
            phone_number='+09876544321'
        )

        self.brand = Brand.objects.create(name='Buick')
        self.model = ModelCar.objects.create(
            name='Grand National', brand=self.brand)

        self.ad = Ad.objects.create(
            user=self.seller,
            title='Black Grand National',
            description='All i ever wanted was a black Grand National',
            brand=self.brand,
            model=self.model,
            year=1987,
            mileage=30000,
            price=Decimal('120000.00')
        )

    def test_create_chat(self):
        # Test for creating chat
        chat = Chat.objects.create(
            ad=self.ad, buyer=self.buyer, seller=self.seller)
        self.assertEqual(chat.ad, self.ad)
        self.assertEqual(chat.buyer, self.buyer)
        self.assertEqual(chat.seller, self.seller)

    def test_chat_string_representation(self):
        # Test for chat string representation
        Chat.objects.create(ad=self.ad, buyer=self.buyer, seller=self.seller)

        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            Chat.objects.create(
                ad=self.ad, buyer=self.buyer, seller=self.seller)

    def test_chat_ordering(self):
        # Test for chat ordering by updated_at
        chat_1 = Chat.objects.create(
            ad=self.ad, buyer=self.buyer, seller=self.seller)

        ad_2 = Ad.objects.create(user=self.seller, title='Buick Regal 1996', description='Another Buick Regal',
                                 model=self.model, brand=self.brand, year=1996, mileage=150000, price=Decimal('3000.00'),)

        chat_2 = Chat.objects.create(
            ad=ad_2, buyer=self.buyer, seller=self.seller)

        chats = list(Chat.objects.all())
        self.assertEqual(chats[0].id, chat_2.id)
        self.assertEqual(chats[1].id, chat_1.id)

    def test_get_other_buyer_perspective(self):
        # Test for getting other user from buyer perspective
        chat = Chat.objects.create(
            ad=self.ad, buyer=self.buyer, seller=self.seller)

        other_user = chat.get_other_user(self.seller)
        self.assertEqual(other_user, self.buyer)


class MessageModelTest(TestCase):
    """Test cases for Message model"""

    def setUp(self):
        self.seller = User.objects.create(
            email='seller@email.com',
            username='seller@email.com',
            password='321qwerty',
            first_name='Seller',
            last_name='User',
            phone_number='+1234567890'
        )

        self.buyer = User.objects.create(
            email='buyer@email.com',
            username='buyer@email.com',
            password='321qwerty',
            first_name='Buyer',
            last_name='User',
            phone_number='+09876544321'
        )

        self.brand = Brand.objects.create(name='Buick')
        self.model = ModelCar.objects.create(
            name='Grand National', brand=self.brand)

        self.ad = Ad.objects.create(
            user=self.seller,
            title='Black Grand National',
            description='All i ever wanted was a black Grand National',
            brand=self.brand,
            model=self.model,
            year=1987,
            mileage=30000,
            price=Decimal('120000.00')
        )

        self.chat = Chat.objects.create(
            ad=self.ad, buyer=self.buyer, seller=self.seller)

    def test_create_message(self):
        # Test for creating a message
        message = Message.objects.create(
            chat=self.chat, sender=self.buyer, content='i wonder if u know')
        expected = f'Message {message.id} from {self.buyer.email} in chat {self.chat.id}'
        self.assertEqual(str(message), expected)

    def test_message_ordering(self):
        # Test for message ordering by created_at
        msg_1 = Message.objects.create(
            chat=self.chat, sender=self.buyer, content='first message')
        msg_2 = Message.objects.create(
            chat=self.chat, sender=self.seller, content='second message')

        messages = list(Message.objects.all())
        self.assertEqual(messages[0].id, msg_1.id)
        self.assertEqual(messages[1].id, msg_2.id)

    def test_message_max_length(self):
        # Test for message content max length
        some_long_text = 'q'*2500
        message = Message.objects.create(
            chat=self.chat, sender=self.buyer, content=some_long_text)

        self.assertEqual(len(message.content), 2500)

    def test_mark_message_as_read(self):
        # Test for marking messages as read
        message = Message.objects.create(
            chat=self.chat, sender=self.buyer, content='something')

        self.assertFalse(message.is_read)
        message.is_read = True
        message.save()
        message.refresh_from_db()

        self.assertTrue(message.is_read)


class ChatViewSetTests(APITestCase):
    """Test cases for Chat API"""

    def setUp(self):
        self.client = APIClient()
        self.seller = User.objects.create_user(
            email='seller@email.com',
            username='seller@email.com',
            password='321qwerty',
            first_name='Seller',
            last_name='User',
            phone_number='+1234567890',
        )
        self.buyer = User.objects.create_user(
            email='buyer@email.com',
            username='buyer@email.com',
            password='321qwerty',
            first_name='Buyer',
            last_name='User',
            phone_number='+0987654321',
        )

        self.brand = Brand.objects.create(name='Buick')
        self.model = ModelCar.objects.create(
            name='Grand National', brand=self.brand)

        self.ad = Ad.objects.create(
            user=self.seller,
            title='Black Grand National',
            description='All i ever wanted was a black Grand National',
            brand=self.brand,
            model=self.model,
            year=1987,
            mileage=30000,
            price=Decimal('120000.00'),
        )

        self.chats_url = reverse('chats-list')

    def test_list_chats_unauthenticated(self):
        # Test for listing chats without authentication
        response = self.client.get(self.chats_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_chats_authenticated(self):
        # Test for listing chats as authneticated user
        Chat.objects.create(ad=self.ad, buyer=self.buyer, seller=self.seller)

        self.client.force_authenticate(user=self.buyer)
        response = self.client.get(self.chats_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_list_chats_empty(self):
        # Test fir listing chats when user ahs none
        self.client.force_authenticate(user=self.buyer)
        response = self.client.get(self.chats_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_get_or_create_chat(self):
        # Test for getting or creating chat endpoint
        self.client.force_authenticate(user=self.buyer)

        url = reverse('chats-get-or-create')
        data = {'ad_id': self.ad.id}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['buyer']['id'], self.buyer.id)
        self.assertEqual(response.data['seller']['id'], self.seller.id)

    def test_get_existing_chat(self):
        # Test foe getting existing chat
        existing_chat = Chat.objects.create(
            ad=self.ad, buyer=self.buyer, seller=self.seller)

        self.client.force_authenticate(user=self.buyer)
        url = reverse('chats-get-or-create')
        data = {'ad_id': self.ad.id}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], existing_chat.id)

    def test_get_or_create_without_ad(self):
        # Test for get or create chat withoud ad_id
        self.client.force_authenticate(user=self.buyer)

        url = reverse('chats-get-or-create')
        response = self.client.post(url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_or_create_with_nonexistent_ad(self):
        # Test for get or create with non existing brand
        self.client.force_authenticate(user=self.buyer)

        url = reverse('chats-get-or-create')
        data = {'ad_id': 9999}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_chat_with_yourself(self):
        # Test for preventing chawt with yourself
        self.client.force_authenticate(user=self.seller)

        url = reverse('chats-get-or-create')
        data = {'ad_id': self.ad.id}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_chat_detail(self):
        # Test for getting chat detail
        chat = Chat.objects.create(
            ad=self.ad, buyer=self.buyer, seller=self.seller)
        Message.objects.create(
            chat=chat, sender=self.buyer, content='some text')

        self.client.force_authenticate(user=self.buyer)
        url = reverse('chats-detail', kwargs={'pk': chat.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['messages']), 1)

    def test_retrieve_chat_unread_count(self):
        # Test for unread count in chat list
        chat = Chat.objects.create(
            ad=self.ad, buyer=self.buyer, seller=self.seller)
        Message.objects.create(
            chat=chat, sender=self.seller, content='unread', is_read=False)

        self.client.force_authenticate(user=self.buyer)
        response = self.client.get(self.chats_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['unread_count'], 1)

    def test_mark_as_read(self):
        # Test for marking messages as read
        chat = Chat.objects.create(
            ad=self.ad, buyer=self.buyer, seller=self.seller)
        msg_1 = Message.objects.create(
            chat=chat, sender=self.seller, content='message 1', is_read=False)
        msg_2 = Message.objects.create(
            chat=chat, sender=self.seller, content='message 2', is_read=False)

        self.client.force_authenticate(user=self.buyer)
        url = reverse('chats-mark-as-read', kwargs={'pk': chat.id})
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        msg_1.refresh_from_db()
        msg_2.refresh_from_db()

        self.assertTrue(msg_1.is_read)
        self.assertTrue(msg_2.is_read)

    def test_seller_access_to_chat(self):
        # Test for seller access to chat
        chat = Chat.objects.create(
            ad=self.ad, buyer=self.buyer, seller=self.seller)

        self.client.force_authenticate(user=self.seller)
        url = reverse('chats-detail', kwargs={'pk': chat.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unauthorized_user_cannot_access_chat(self):
        # Test for preventing unauthorized access to chat
        other_user = User.objects.create_user(
            email='otheruser@email.com',
            username='otheruser@email.com',
            password='321qwerty',
            first_name='Other',
            last_name='User',
            phone_number='+123123123123'
        )

        chat = Chat.objects.create(
            ad=self.ad, buyer=self.buyer, seller=self.seller)

        self.client.force_authenticate(user=other_user)
        url = reverse('chats-detail', kwargs={'pk': chat.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_chat_last_message(self):
        # Test for last_message in chat list
        chat = Chat.objects.create(
            ad=self.ad, buyer=self.buyer, seller=self.seller)

        Message.objects.create(
            chat=chat, sender=self.buyer, content='first message')
        last_msg = Message.objects.create(
            chat=chat, sender=self.seller, content='last message')

        self.client.force_authenticate(user=self.buyer)
        response = self.client.get(self.chats_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data[0]['last_message']['content'], 'last message')
        self.assertEqual(
            response.data[0]['last_message']['sender_id'], self.seller.id)

    def test_retrieve_marks_messages_as_read(self):
        # Test for retrieving chat marks unread messages as read
        chat = Chat.objects.create(
            ad=self.ad, buyer=self.buyer, seller=self.seller)
        message = Message.objects.create(
            chat=chat, sender=self.seller, content='some text', is_read=False)

        self.client.force_authenticate(user=self.buyer)
        url = reverse('chats-detail', kwargs={'pk': chat.id})
        self.client.get(url)

        message.refresh_from_db()
        self.assertTrue(message.is_read)
