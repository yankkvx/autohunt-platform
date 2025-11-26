from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse


User = get_user_model()


class UserModelTests(TestCase):
    """Test cases for User model"""

    def setUp(self):
        self.user_data = {
            'email': 'test@email.com',
            'password': 'testpassword123',
            'first_name': 'Test',
            'last_name': 'User',
            'phone_number': '+1234567890',
            'account_type': 'private'
        }

    def test_create_user(self):
        # Test for creating default user
        user = User.objects.create_user(**self.user_data)

        self.assertEqual(user.email, self.user_data['email'])
        self.assertTrue(user.check_password(self.user_data['password']))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertTrue(user.is_active)

    def test_create_superuser(self):
        # Test for creating superuser
        superuser = User.objects.create_superuser(
            email='admin@email.com',
            password='321qwerty',
        )
        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.is_superuser)
        self.assertTrue(superuser.is_active)

    def test_create_user_without_email_raises_error(self):
        # Test for creating user without an email
        with self.assertRaises(ValueError):
            User.objects.create_user(email='', password='testpassword123')

    def test_get_location_display_with_full_data(self):
        # Test get_location_display with full data
        user = User.objects.create_user(**self.user_data)
        user.city = 'New York'
        user.state = 'New York'
        user.country = 'United States'
        user.save()
        expected = 'New York, New York, United States'

        self.assertEqual(user.get_location_display(), expected)

    def test_get_location_without_data(self):
        # Test get_location_display without data
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(user.get_location_display(), 'Location not specified')

    def test_set_location_from_geocode(self):
        # Test for setting location from geocode data
        user = User.objects.create_user(**self.user_data)
        geocode_data = {
            'display_name': 'New York, USA',
            'latitude': 40.7128,
            'longitude': -74.0060,
            'address': {
                'city': 'New York',
                'state': 'New York',
                'country': 'United States',
                'country_code': 'US',
                'post_code': '10007'
            }
        }

        user.set_location_from_geocode(geocode_data)

        self.assertEqual(user.city, 'New York')
        self.assertEqual(user.country, 'United States')
        self.assertEqual(float(user.latitude), 40.7128)
        self.assertEqual(float(user.longitude), -74.0060)


class RegisterViewTests(APITestCase):
    """Tests for register users"""

    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('sign-up')
        self.valid_data = {
            'email': 'newuser@email.com',
            'password': '321qwerty',
            'password_confirm': '321qwerty',
            'first_name': 'New',
            'last_name': 'User',
            'phone_number': '+1234567890',
            'account_type': 'private'
        }

    def test_register_user_success(self):
        # Test for successful registration
        response = self.client.post(
            self.register_url, self.valid_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['email'], self.valid_data['email'])

        user_exists = User.objects.filter(
            email=self.valid_data['email']).exists()
        self.assertTrue(user_exists)

    def test_register_password_dont_match(self):
        # Test for mismatching passwords
        data = self.valid_data.copy()
        data['password_confirm'] = 'qwerty321'

        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_email_exists(self):
        # Test for registration with existing email
        self.client.post(self.register_url, self.valid_data, format='json')

        response = self.client.post(
            self.register_url, self.valid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_company_without_company_name(self):
        # Test for registering a company account without a company name
        data = self.valid_data.copy()
        data['account_type'] = 'company'
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_company_with_company_name(self):
        # Test for registering a company account with a company name
        data = self.valid_data.copy()
        data['account_type'] = 'company'
        data['company_name'] = 'test company'
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['company_name'], 'test company')


class LoginViewTest(APITestCase):
    """Test for login users"""

    def setUp(self):
        self.client = APIClient()
        self.login_url = reverse('token-obtain-pair')
        self.user_data = {
            'email': 'test@email.com',
            'password': '321qwerty',
            'first_name': 'Test',
            'last_name': 'User',
            'phone_number': '+1234567890'
        }
        self.user = User.objects.create_user(**self.user_data)

    def test_login_success(self):
        # Test for successful login
        login_data = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['email'], self.user_data['email'])

    def test_login_wrong_password(self):
        # Test for login with wrong password
        login_data = {
            'email': self.user_data['email'],
            'password': '123123123'
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_non_existing_account(self):
        # Test for login with a non-existent user
        login_data = {
            'email': 'nonexisting@email.com',
            'password': '123123123'
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserManagementTests(APITestCase):
    """Tests for user management"""

    def setUp(self):
        self.client = APIClient()
        self.user_management_url = reverse('user-management')
        self.user_data = {
            'email': 'test@email.com',
            'password': '321qwerty',
            'first_name': 'Test',
            'last_name': 'User',
            'phone_number': '+1234567890'
        }
        self.user = User.objects.create_user(**self.user_data)
        self.client.force_authenticate(user=self.user)

    def test_get_user_profile(self):
        # Test for getting user profile
        response = self.client.get(self.user_management_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user_data['email'])
        self.assertEqual(response.data['first_name'],
                         self.user_data['first_name'])

    def test_update_user_profile(self):
        # Test for updating profile
        update_data = {
            'first_name': 'Updated',
            'about': 'Updated bio'
        }
        response = self.client.put(
            self.user_management_url, update_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'Updated')
        self.assertEqual(response.data['about'], 'Updated bio')

        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')

    def test_update_profile_duplicate_number(self):
        # Test for updating profile with duplicated phone number
        other_user = User.objects.create_user(
            email='other_email@email.com',
            username='other_email@email.com',
            password='321qwerty',
            phone_number='+123123123132',
            first_name='Other',
            last_name='User'
        )

        updated_data = {'phone_number': other_user.phone_number}

        response = self.client.put(
            self.user_management_url, updated_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_account_with_correct_password(self):
        # Test for deleting acc with correct password
        delete_data = {'password': self.user_data['password']}
        response = self.client.delete(
            self.user_management_url, delete_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        user_exists = User.objects.filter(id=self.user.id).exists()
        self.assertFalse(user_exists)

    def test_delete_account_with_wrong_password(self):
        # Test for deleting acc with wrong password
        delete_data = {'password': 'wrong123'}
        response = self.client.delete(
            self.user_management_url, delete_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        user_exists = User.objects.filter(id=self.user.id).exists()
        self.assertTrue(user_exists)

    def test_unauthenticated_access(self):
        # Test for unauthenticated access
        self.client.force_authenticate(user=None)

        response = self.client.get(self.user_management_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PublicProfileTests(APITestCase):
    """Tests for public profiles"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='public@email.com',
            password='321public',
            first_name='Public',
            last_name='User',
            phone_number='+1234567890',
            about='Public about'
        )

    def test_view_public_profile(self):
        # Test for viewing public profile
        url = reverse('public-profile', kwargs={'pk': self.user.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'public@email.com')
        self.assertEqual(response.data['about'], 'Public about')

    def test_view_non_existent_profile(self):
        # Test for viewing non existent profile
        url = reverse('public-profile', kwargs={'pk': 123123})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_view_inactive_profile(self):
        # Test for viewing inactive profile
        self.user.is_active = False
        self.user.save()

        url = reverse('public-profile', kwargs={'pk': self.user.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
