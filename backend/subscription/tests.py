from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from django.urls import reverse
from decimal import Decimal
from .models import SubscriptionPlan, UserSubscription
from account.models import User as CustomerUser
from django.utils import timezone
from datetime import timedelta
from .serializers import UserSubscriptionSerializer, RecentSubscriptionSerializer, SubscriptionStatsSerializer

User = get_user_model()


class SubscriptionPlanModelTests(TestCase):
    """Test cases for SubscriptionPlan model"""

    def setUp(self):
        self.plan_data = {
            'name': 'Premium Plan',
            'description': 'Get more ad slots',
            'additional_ads': 10,
            'price': Decimal('19.99'),
            'duration_days': 30,
            'is_active': True,
        }

    def test_create_subscription_plan(self):
        # Test for creating subscription plan
        plan = SubscriptionPlan.objects.create(**self.plan_data)

        self.assertEqual(plan.name, 'Premium Plan')
        self.assertEqual(plan.additional_ads, 10)
        self.assertEqual(float(plan.price), 19.99)

    def test_subscription_plan_string_representation(self):
        # Test for string representation
        plan = SubscriptionPlan.objects.create(**self.plan_data)
        expected = f'Premium Plan - 10 ads ($19.99)'

        self.assertEqual(str(plan), expected)

    def test_plan_ordering_by_price(self):
        # Test for ordering plans by price
        plan_1 = SubscriptionPlan.objects.create(
            name='Basic Plan', additional_ads=5, price=Decimal('9.99'), is_active=True)
        plan_2 = SubscriptionPlan.objects.create(
            name='Starter Plan', additional_ads=10, price=Decimal('14.99'), is_active=True)

        plans = list(SubscriptionPlan.objects.all())
        self.assertEqual(plans[0].price, Decimal('9.99'))
        self.assertEqual(plans[1].price, Decimal('14.99'))

    def test_inactive_plan(self):
        # Test for creating inactive plans
        plan_1 = SubscriptionPlan.objects.create(
            name='Basic Plan', additional_ads=5, price=Decimal('9.99'), is_active=True)
        plan_2 = SubscriptionPlan.objects.create(
            name='Starter Plan', additional_ads=10, price=Decimal('14.99'), is_active=False)

        plans = list(SubscriptionPlan.objects.all())
        self.assertEqual(len(plans), 2)
        self.assertFalse(plans[1].is_active)


class UserSubscriptionModelTests(TestCase):
    """Test cases for UserSubscription model"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='user@email.com',
            password='321qwerty',
            first_name='Test',
            last_name='User',
            phone_number='+1234567890',
            account_type='company',
        )

        self.plan = SubscriptionPlan.objects.create(
            name='Premium Plan',
            description='Get more ad slots',
            additional_ads=10,
            price=Decimal('19.99'),
            duration_days=30,
            is_active=True,
        )

    def test_create_user_subscription(self):
        # Test for creating user subscription
        subscription = UserSubscription.objects.create(
            user=self.user,
            plan=self.plan,
            plan_name=self.plan.name,
            additional_ads=self.plan.additional_ads,
            end_date=timezone.now() + timedelta(days=30),
            is_active=True
        )
        self.assertEqual(subscription.user, self.user)
        self.assertEqual(subscription.plan, self.plan)
        self.assertTrue(subscription.is_active)

    def test_subscription_auto_end_date(self):
        # Test for automatic end_date calculation
        subscription = UserSubscription.objects.create(
            user=self.user,
            plan=self.plan,
            plan_name=self.plan.name,
            additional_ads=self.plan.additional_ads,
            end_date=timezone.now() + timedelta(days=30),
            is_active=True
        )
        self.assertIsNotNone(subscription.end_date)
        time_diff = subscription.end_date - subscription.start_date
        self.assertAlmostEqual(time_diff.days, 30, delta=1)

    def test_subscription_is_expired_property(self):
        # Test for is_expired property
        past_end_date = timezone.now() - timedelta(days=5)
        subscription = UserSubscription.objects.create(
            user=self.user,
            plan=self.plan,
            plan_name=self.plan.name,
            additional_ads=self.plan.additional_ads,
            end_date=past_end_date,
            is_active=True
        )

        self.assertTrue(subscription.is_expired)

    def test_subscription_days_remaining(self):
        # Test for days_remaining property
        future_end_date = timezone.now() + timedelta(days=15)
        subscription = UserSubscription.objects.create(
            user=self.user,
            plan=self.plan,
            plan_name=self.plan.name,
            additional_ads=self.plan.additional_ads,
            end_date=future_end_date,
            is_active=True
        )
        days_remaining = subscription.days_remaining
        self.assertGreater(days_remaining, 0)
        self.assertLessEqual(days_remaining, 15)

    def test_subscription_string_representation(self):
        # Test for string representation
        subscription = UserSubscription.objects.create(
            user=self.user,
            plan=self.plan,
            plan_name=self.plan.name,
            additional_ads=self.plan.additional_ads,
            end_date=timezone.now() + timedelta(days=30),
            is_active=True
        )
        self.assertIn(self.user.email, str(subscription))
        self.assertIn('Active', str(subscription))

    def test_inactive_subscription_string_representation(self):
        # Test for inactive subscription string representation
        subscription = UserSubscription.objects.create(
            user=self.user,
            plan=self.plan,
            plan_name=self.plan.name,
            additional_ads=self.plan.additional_ads,
            end_date=timezone.now() + timedelta(days=30),
            is_active=False
        )

        self.assertIn('Expired', str(subscription))


class SubscriptionPlanViewSetTests(APITestCase):
    """Test cases for SubscriptionPlan API"""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            email='admin@email.com', password='321qwerty')

        self.default_user = User.objects.create_user(
            email='test@email.com',
            username='test@email.com',
            password='321qwerty',
            first_name='Test',
            last_name='User',
            phone_number='+1234567890'
        )

        self.plan = SubscriptionPlan.objects.create(
            name='Premium Plan',
            description='Get more ad slots',
            additional_ads=10,
            price=Decimal('19.99'),
            duration_days=30,
            is_active=True,
        )

        self.plan_url = reverse('subscription-plan-list')

    def test_list_plans_unauthenticated(self):
        # Test for listing plans without authentication
        response = self.client.get(self.plan_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_list_plans_only_active(self):
        # Test for listing only active plans for unauthenticated users
        SubscriptionPlan.objects.create(
            name='Inactive Plan',
            additional_ads=5,
            price=Decimal('9.99'),
            duration_days=30,
            is_active=False
        )

        response = self.client.get(self.plan_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_list_all_plans_as_admin(self):
        # Test for admin seeing inactive plans
        SubscriptionPlan.objects.create(
            name='Inactive Plan',
            additional_ads=5,
            price=Decimal('9.99'),
            duration_days=30,
            is_active=False
        )

        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.plan_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_retieving_plan_unauthenticated(self):
        # Test for retrieving specific plan
        url = reverse('subscription-plan-detail', kwargs={'pk': self.plan.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Premium Plan')

    def test_create_plan_as_admin(self):
        # Test for creating plan as admin user
        self.client.force_authenticate(user=self.admin_user)

        data = {
            'name': 'Ultimate Plan',
            'description': 'Get more ad slots for businesses',
            'additional_ads': 50,
            'price': Decimal('99.99'),
            'duration_days': 30,
            'is_active': True,
        }
        response = self.client.post(self.plan_url, data, format='json')
        plans = list(SubscriptionPlan.objects.all())

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(plans), 2)
        self.assertEqual(response.data['name'], 'Ultimate Plan')

    def test_create_plan_as_default_user(self):
        # Test for creating plan as default user
        self.client.force_authenticate(user=self.default_user)
        data = {
            'name': 'Ultimate Plan',
            'description': 'Get more ad slots for businesses',
            'additional_ads': 50,
            'price': Decimal('99.99'),
            'duration_days': 30,
            'is_active': True,
        }
        response = self.client.post(self.plan_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_plan_as_admin(self):
        # Test for updating plan as admin user
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('subscription-plan-detail', kwargs={'pk': self.plan.id})
        data = {'name': 'Updated plan name'}
        response = self.client.patch(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated plan name')

    def test_delete_plan_as_admin(self):
        # Test for deleting plan as admin user
        self.client.force_authenticate(user=self.admin_user)

        url = reverse('subscription-plan-detail', kwargs={'pk': self.plan.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(SubscriptionPlan.objects.filter(
            id=self.plan.id).exists())


class UserSubscriptionViewSetTests(APITestCase):
    """Test cases for UserSubscription API"""

    def setUp(self):
        self.client = APIClient()
        self.company_user = User.objects.create_user(
            email='company@email.com',
            username='company@email.com',
            password='321qwerty',
            first_name='Company',
            last_name='User',
            phone_number='+1234567890',
            account_type='company',
        )
        self.private_user = User.objects.create_user(
            email='private@email.com',
            username='private@email.com',
            password='321qwerty',
            first_name='Private',
            last_name='User',
            phone_number='+0987654321',
            account_type='private',
        )

        self.plan = SubscriptionPlan.objects.create(
            name='Premium Plan',
            description='Get more ad slots',
            additional_ads=10,
            price=Decimal('19.99'),
            duration_days=30,
            is_active=True,
        )

        self.subscription_url = reverse('user-subscriptions-list')

    def test_list_user_subscriptions_authenticated(self):
        # Test for listing user subscriptions
        UserSubscription.objects.create(
            user=self.company_user,
            plan=self.plan,
            plan_name=self.plan.name,
            additional_ads=self.plan.additional_ads,
            end_date=timezone.now() + timedelta(days=30),
            is_active=True
        )

        self.client.force_authenticate(user=self.company_user)
        response = self.client.get(self.subscription_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_list_subscriptions_unauthenticated(self):
        # Test for listing subscriptions without authentication
        response = self.client.get(self.subscription_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_activate_subscription(self):
        # Test for gettting active subscription
        UserSubscription.objects.create(
            user=self.company_user,
            plan=self.plan,
            plan_name=self.plan.name,
            additional_ads=self.plan.additional_ads,
            end_date=timezone.now()+timedelta(days=30),
            is_active=True
        )
        UserSubscription.objects.create(
            user=self.company_user,
            plan=self.plan,
            plan_name=self.plan.name,
            additional_ads=self.plan.additional_ads,
            end_date=timezone.now()+timedelta(days=5),
            is_active=False
        )

        self.client.force_authenticate(user=self.company_user)
        url = reverse('user-subscriptions-active')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_activate_subscription_as_company_user(self):
        # Test for activating subscription as compnay user
        self.client.force_authenticate(user=self.company_user)

        url = reverse('user-subscriptions-activate')
        data = {
            'plan_id': self.plan.id,
            'paypal_order_id': 'order_12345',
            'paypal_payer_id': 'payer_12345',
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['is_active'])

    def test_activate_subscription_as_private_user(self):
        # Test for preventing private users from activating subscriptions
        self.client.force_authenticate(user=self.private_user)

        url = reverse('user-subscriptions-activate')
        data = {
            'plan_id': self.plan.id,
            'paypal_order_id': 'order_12345',
            'paypal_payer_id': 'payer_12345',
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_activate_duplicate_payment(self):
        # Test for preventing duplicate payment activation
        UserSubscription.objects.create(
            user=self.company_user,
            plan=self.plan,
            plan_name=self.plan.name,
            additional_ads=self.plan.additional_ads,
            end_date=timezone.now()+timedelta(days=30),
            paypal_order_id='order_12345',
            is_active=True
        )

        self.client.force_authenticate(user=self.company_user)

        url = reverse('user-subscriptions-activate')
        data = {
            'plan_id': self.plan.id,
            'paypal_order_id': 'order_12345',
            'paypal_payer_id': 'payer_12345',
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_activate_with_invalid_plan(self):
        # Test for activating with invalid plan
        self.client.force_authenticate(user=self.company_user)

        url = reverse('user-subscriptions-activate')
        data = {
            'plan_id': 123123,
            'paypal_order_id': 'order_12345',
            'paypal_payer_id': 'payer_12345',
        }
        response = self.client.post(url, data, format='json')

        # 400 status code because of validate_plan_id method in ActivateSubscriptionSerializer
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_subscription_stats(self):
        # Test for getting subscriptions stats
        UserSubscription.objects.create(
            user=self.company_user,
            plan=self.plan,
            plan_name=self.plan.name,
            additional_ads=self.plan.additional_ads,
            end_date=timezone.now()+timedelta(days=30),
            is_active=True
        )

        self.client.force_authenticate(user=self.company_user)
        url = reverse('user-subscriptions-stats')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['limit'], 10 + self.plan.additional_ads)
        self.assertTrue(response.data['has_active_subscription'])


class ValidatePurchaseViewTests(APITestCase):
    """Test cases for ValidatePurchase API"""

    def setUp(self):
        self.client = APIClient()
        self.company_user = User.objects.create_user(
            email='company@email.com',
            username='company@email.com',
            password='321qwerty',
            first_name='Company',
            last_name='User',
            phone_number='+1234567890',
            account_type='company',
        )
        self.private_user = User.objects.create_user(
            email='private@email.com',
            username='private@email.com',
            password='321qwerty',
            first_name='Private',
            last_name='User',
            phone_number='+0987654321',
            account_type='private',
        )

        self.plan_1 = SubscriptionPlan.objects.create(
            name='Basic Plan',
            description='Get some ad slots',
            additional_ads=5,
            price=Decimal('9.99'),
            duration_days=30,
            is_active=True,
        )

        self.plan_2 = SubscriptionPlan.objects.create(
            name='Premium Plan',
            description='Get more ad slots',
            additional_ads=10,
            price=Decimal('19.99'),
            duration_days=30,
            is_active=True,
        )

        self.validate_url = reverse('validate-purchase')

    def test_validate_purchase_as_company_user(self):
        # Test for validating purchase as company user
        self.client.force_authenticate(user=self.company_user)

        data = {'plan_id': self.plan_1.id}
        response = self.client.post(self.validate_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_validate_purchase_as_private_user(self):
        # Test for preventing private users from validating purchase
        self.client.force_authenticate(user=self.private_user)

        data = {'plan_id': self.plan_1.id}
        response = self.client.post(self.validate_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_validate_purchase_without_authentication(self):
        # Test for validating purchase without authentication
        data = {'plan_id': self.plan_1.id}
        response = self.client.post(self.validate_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_validate_purchase_with_invalid_plan(self):
        # Test for validating purchase with invalid plan
        self.client.force_authenticate(user=self.company_user)

        data = {'plan_id': 123123}
        response = self.client.post(self.validate_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_validate_purchase_same_plan(self):
        # Test for validating purchase of same active plan
        UserSubscription.objects.create(
            user=self.company_user,
            plan=self.plan_1,
            plan_name=self.plan_1.name,
            additional_ads=self.plan_1.additional_ads,
            end_date=timezone.now()+timedelta(days=30),
            is_active=True
        )

        self.client.force_authenticate(user=self.company_user)

        data = {'plan_id': self.plan_1.id}
        response = self.client.post(self.validate_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_validate_downgrade_plan(self):
        # Test for preventing downgrage plan
        UserSubscription.objects.create(
            user=self.company_user,
            plan=self.plan_2,
            plan_name=self.plan_2.name,
            additional_ads=self.plan_2.additional_ads,
            end_date=timezone.now() + timedelta(days=30),
            is_active=True
        )

        self.client.force_authenticate(user=self.company_user)

        data = {'plan_id': self.plan_1.id}
        response = self.client.post(self.validate_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class SubscriptionSerializersTests(TestCase):
    """Test cases for subscription serializers"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@email.com',
            username='test@email.com',
            password='321qwerty',
            first_name='Test',
            last_name='User',
            phone_number='+1234567890',
            account_type='company',
        )

        self.plan = SubscriptionPlan.objects.create(
            name='Test Plan',
            description='Test description',
            additional_ads=5,
            price=Decimal('19.99'),
            duration_days=30,
            is_active=True
        )

        self.subscription = UserSubscription.objects.create(
            user=self.user,
            plan=self.plan,
            plan_name=self.plan.name,
            additional_ads=self.plan.additional_ads,
            end_date=timezone.now()+timedelta(days=30),
            amount_paid=self.plan.price,
            is_active=True
        )

    def test_user_sub_serializer_includes_amount_paid(self):
        # Test that UserSubscriptionSerializer inclides amount paid
        serializer = UserSubscriptionSerializer(self.subscription)
        data = serializer.data

        self.assertIn('amount_paid', data)
        self.assertEqual(str(data['amount_paid']), '19.99')

    def test_recent_sub_serializer(self):
        # Test RecentSubscriptionSerializer

        serializer = RecentSubscriptionSerializer(self.subscription)
        data = serializer.data

        self.assertIn('user_email', data)
        self.assertIn('plan_name', data)
        self.assertIn('amount_paid', data)
        self.assertEqual(data['user_email'], self.user.email)
        self.assertEqual(data['plan_name'], self.plan.name)

    def test_recent_sub_serializer_handles_none_amount(self):
        # Test that RecentSubscriptionSerializer handles None for amount_paid

        sub = UserSubscription.objects.create(
            user=self.user,
            plan=self.plan,
            plan_name=self.plan.name,
            additional_ads=self.plan.additional_ads,
            end_date=timezone.now() + timedelta(days=30),
            amount_paid=None,
            is_active=True
        )
        serializer = RecentSubscriptionSerializer(sub)
        data = serializer.data

        self.assertEqual(data['amount_paid'], '0.00')

    def test_subscription_stats_serializers(self):
        # Test SubscriptionStatsSerializer structure

        stats_data = {
            'summary': {
                'total_revenue': Decimal('19.99'),
                'total_subscriptions': 1,
                'active_subscriptions': 1,
            },
            'revenue_by_period': [
                {'period': timezone.now(), 'revenue': Decimal('19.99'), 'count': 1}
            ],
            'revenue_by_plan': [
                {'plan_name': 'Test Plan',
                    'revenue': Decimal('19.99'), 'count': 1}
            ],
            'recent_subscriptions': [self.subscription]
        }

        serializer = SubscriptionStatsSerializer(stats_data)
        data = serializer.data

        self.assertIn('summary', data)
        self.assertIn('revenue_by_period', data)
        self.assertIn('revenue_by_plan', data)
        self.assertIn('recent_subscriptions', data)

        self.assertEqual(data['summary']['total_revenue'], '19.99')
        self.assertEqual(data['summary']['total_subscriptions'], 1)
        self.assertEqual(data['summary']['active_subscriptions'], 1)

        self.assertEqual(data['revenue_by_period'][0]['revenue'], '19.99')
        self.assertEqual(data['revenue_by_period'][0]['count'], 1)
