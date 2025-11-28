from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from decimal import Decimal
from .models import Ad, AdImage, Favourite
from catalog.models import Brand, ModelCar, BodyType, FuelType
from django.core.exceptions import ValidationError
from .filters import AdFilter

User = get_user_model()


class AdModelTests(TestCase):
    """Test cases for Ad model"""

    def setUp(self):
        self.user = User.objects.create(
            email='test@email.com',
            password='321qwerty',
            first_name='Test',
            last_name='User',
            phone_number='+1234567890'
        )
        self.brand = Brand.objects.create(name='Buick')
        self.model = ModelCar.objects.create(
            name='Grand National', brand=self.brand)
        self.body_type = BodyType.objects.create(name='Coupe')
        self.fuel_type = FuelType.objects.create(name='Petrol')

        self.ad_data = {
            'user': self.user,
            'title': 'Black Grand National',
            'description': 'All i ever wanted was a black Grand National',
            'brand': self.brand,
            'model': self.model,
            'body_type': self.body_type,
            'fuel_type': self.fuel_type,
            'year': 1987,
            'mileage': 30000,
            'power': 276,
            'capacity': Decimal('3.8'),
            'price': Decimal('50000.00'),
            'location': 'Los Angeles, United States'
        }

    def test_create_ad(self):
        # Test for creating ad
        ad = Ad.objects.create(**self.ad_data)

        self.assertEqual(ad.title, 'Black Grand National')
        self.assertEqual(ad.user, self.user)
        self.assertEqual(ad.brand, self.brand)
        self.assertEqual(float(ad.price), 50000.00)

    def test_ad_string_representation(self):
        # Test for string representation of ad
        ad = Ad.objects.create(**self.ad_data)
        expected = f'Ad {ad.id}: {self.user.email} - {self.brand} - {self.model}'
        self.assertEqual(str(ad), expected)

    def test_get_location_display_with_full_data(self):
        # Test for displaying location when all data is provided
        ad = Ad.objects.create(**self.ad_data)
        ad.city = 'Los Angeles'
        ad.state = 'California'
        ad.country = 'United States'
        ad.save()
        expected = 'Los Angeles, California, United States'

        self.assertEqual(ad.get_location_display(), expected)

    def test_get_location_display_without_data(self):
        # Test for displaying location when no data is provided
        ad_data = self.ad_data.copy()
        ad_data['location'] = ''
        ad = Ad.objects.create(**ad_data)

        self.assertEqual(ad.get_location_display(), 'Location not specified.')

    def test_set_location_from_geocode(self):
        # Test for setting location from geocode data
        ad = Ad.objects.create(**self.ad_data)
        geocode_data = {
            'display_name': 'Los Angeles, United States',
            'latitude': 34.0522,
            'longitude': -118.2347,
            'address': {
                'city': 'Los Angeles',
                'state': 'California',
                'country': 'United States',
                'country_code': 'US',
                'postcode': '90001'
            }
        }

        ad.set_location_from_geocode(geocode_data)
        self.assertEqual(float(ad.latitude), 34.0522)
        self.assertEqual(ad.get_location_display(),
                         'Los Angeles, California, United States')

    def test_validation_electric_without_battery_capacity(self):
        # Test for validation of electic car without battery capacity
        fuel_type_electric = FuelType.objects.create(name='Electric')
        ad = Ad(
            user=self.user,
            title='Tesla',
            brand=self.brand,
            model=self.model,
            fuel_type=fuel_type_electric,
            year=2023,
            mileage=30000,
            price=Decimal('45000.00'),
            battery_power=450,
        )
        with self.assertRaises(ValidationError) as context:
            ad.clean()
        self.assertIn('battery_capacity', context.exception.message_dict)

    def test_validation_petrol_without_capacity(self):
        # Test for validation of non electric car without capacity
        ad = Ad(
            user=self.user,
            title='Some Petrol Car',
            brand=self.brand,
            model=self.model,
            fuel_type=self.fuel_type,
            year=2023,
            mileage=5000,
            price=Decimal('45000.00'),
            power=300,
        )
        with self.assertRaises(ValidationError) as context:
            ad.clean()
        self.assertIn('capacity', context.exception.message_dict)

    def test_ad_validation_invalid_year_too_old(self):
        # Test for year validation (too old)
        ad_data = self.ad_data.copy()
        ad_data['year'] = 1800
        ad = Ad(**ad_data)
        with self.assertRaises(ValidationError) as context:
            ad.clean()
        self.assertIn('year', context.exception.message_dict)

    def test_ad_validation_invalid_year_future(self):
        # Test for year validation (future)
        ad_data = self.ad_data.copy()
        ad_data['year'] = 2054
        ad = Ad(**ad_data)
        with self.assertRaises(ValidationError) as context:
            ad.clean()
        self.assertIn('year', context.exception.message_dict)

    def test_ad_ordering(self):
        # Test for default ordering of ads
        ad_1 = Ad.objects.create(**self.ad_data)
        ad_data_2 = self.ad_data.copy()
        ad_data_2['title'] = 'Second ad'
        ad_2 = Ad.objects.create(**ad_data_2)

        ads = list(Ad.objects.all())
        self.assertEqual(ads[0].id, ad_2.id)
        self.assertEqual(ads[1].id, ad_1.id)


class AdImageModelTests(TestCase):
    """Test cases for AdImage model"""

    def setUp(self):
        self.user = User.objects.create(
            email='test@email.com',
            password='321qwerty',
            first_name='Test',
            last_name='User',
            phone_number='+1234567890'
        )
        self.brand = Brand.objects.create(name='Buick')
        self.model = ModelCar.objects.create(
            name='Grand National', brand=self.brand)

        self.ad = Ad.objects.create(
            user=self.user,
            title='Black Grand National',
            description='All i ever wanted was a black Grand National',
            brand=self.brand,
            model=self.model,
            year=1987,
            mileage=30000,
            price=Decimal('50000.00'),
        )

    def test_create_ad_image(self):
        # Test for creating ad image
        image = AdImage.objects.create(ad=self.ad)
        self.assertEqual(image.ad, self.ad)
        self.assertEqual(f'Image for Ad №{self.ad.id}', str(image))

    def test_unlinked_image_string(self):
        # Test for string representation of unlinked image
        image = AdImage.objects.create()
        self.assertEqual(str(image), 'Unlinked image')


class AdFilterTests(TestCase):
    """Test cases for ad filtering"""

    def setUp(self):
        self.user = User.objects.create(
            email='test@email.com',
            password='321qwerty',
            first_name='Test',
            last_name='User',
            phone_number='+1234567890'
        )
        self.brand = Brand.objects.create(name='Buick')
        self.model = ModelCar.objects.create(
            name='Grand National', brand=self.brand)
        self.fuel_type = FuelType.objects.create(name='Petrol')

        for i in range(5):
            Ad.objects.create(
                user=self.user,
                title=f'Buick {1980 + i}',
                brand=self.brand,
                model=self.model,
                fuel_type=self.fuel_type,
                year=1980+i,
                mileage=10000 * (i+1),
                price=Decimal(str(30000 + 5000*i))
            )

    def test_filter_by_year_range(self):
        # Test for filtering ads by year range
        filtered = AdFilter(
            data={'year_min': 1980, 'year_max': 1982}, queryset=Ad.objects.all())
        self.assertEqual(filtered.qs.count(), 3)

    def test_filter_by_price_range(self):
        # Test for filtering ads by price range
        filtered = AdFilter(
            data={'price_min': 35000, 'price_max': 50000}, queryset=Ad.objects.all())
        self.assertEqual(filtered.qs.count(), 4)

    def test_filter_by_mileage_range(self):
        # Test for filtering ads by mileage range
        filtered = AdFilter(
            data={'mileage_min': 20000, 'mileage_max': 40000}, queryset=Ad.objects.all())
        self.assertEqual(filtered.qs.count(), 3)

    def test_filter_by_brand(self):
        # Test for filtering ads by brand 
        filtered = AdFilter(
            data={'brand': [self.brand.id]}, queryset=Ad.objects.all())
        self.assertEqual(filtered.qs.count(), 5)


class FavouriteModelTests(TestCase):
    """Test cases for Favourite model"""

    def setUp(self):
        self.user = User.objects.create(
            email='test@email.com',
            password='321qwerty',
            first_name='Test',
            last_name='User',
            phone_number='+1234567890'
        )
        self.brand = Brand.objects.create(name='Buick')
        self.model = ModelCar.objects.create(
            name='Grand National', brand=self.brand)

        self.ad = Ad.objects.create(
            user=self.user,
            title='Black Grand National',
            description='All i ever wanted was a black Grand National',
            brand=self.brand,
            model=self.model,
            year=1987,
            mileage=30000,
            price=Decimal('50000.00'),
        )

    def test_create_favourite(self):
        # Test for creating favourite 
        favourite = Favourite.objects.create(ad=self.ad, user=self.user)

        self.assertEqual(favourite.ad, self.ad)
        self.assertEqual(favourite.user, self.user)

    def test_favourite_unique_constraint(self):
        # Test for unique pairs (ad, user)
        Favourite.objects.create(ad=self.ad, user=self.user)

        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            Favourite.objects.create(ad=self.ad, user=self.user)


class AdViewSetTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@email.com',
            password='321qwerty',
            first_name='Test',
            last_name='User',
            phone_number='+1234567890'
        )
        self.brand = Brand.objects.create(name='Buick')
        self.model = ModelCar.objects.create(
            name='Grand National', brand=self.brand)

        self.ad_data = {
            'title': 'Black Grand National',
            'description': 'All i ever wanted was a black Grand National',
            'brand_id': self.brand.id,
            'model_id': self.model.id,
            'year': 1987,
            'mileage': 30000,
            'price': 50000.00,
            'condition': 'used',
        }

        self.ad_list_url = reverse('ads-list')

    def test_list_ads_unauthenticated(self):
        # Test for getting ads list without authorization
        response = self.client.get(self.ad_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_ad_authenticated(self):
        # Test for creating ad by authorized user
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.ad_list_url, self.ad_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Black Grand National')

    def test_create_ad_unauthenticated(self):
        # Test for creating ad by unauthorized
        response = self.client.post(
            self.ad_list_url, self.ad_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_ad(self):
        # Test for retrieving a specific ad
        ad = Ad.objects.create(
            user=self.user,
            title='Test ad',
            description='Test description',
            brand=self.brand,
            model=self.model,
            year=1987,
            mileage=30000,
            price=Decimal('50000.00'),
        )

        url = reverse('ads-detail', kwargs={'pk': ad.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test ad')

    def test_update_ad_by_owner(self):
        # Test for updating ad by its owner
        ad = Ad.objects.create(
            user=self.user,
            title='Test ad',
            description='Test description',
            brand=self.brand,
            model=self.model,
            year=1987,
            mileage=30000,
            price=Decimal('50000.00'),
        )

        self.client.force_authenticate(user=self.user)
        url = reverse('ads-detail', kwargs={'pk': ad.id})

        update_data = {'title': 'New Title'}
        response = self.client.patch(url, update_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'New Title')

    def test_update_ad_by_other_user(self):
        # Test for updating ad by non owner
        other_user = User.objects.create_user(
            email='other_user@email.com',
            username='other_user@email.com',
            password='321qwerty',
            first_name='Other',
            last_name='User',
            phone_number='+0987654321',
        )
        ad = Ad.objects.create(
            user=self.user,
            title='Test ad',
            description='Test description',
            brand=self.brand,
            model=self.model,
            year=1987,
            mileage=30000,
            price=Decimal('50000.00'),
        )

        self.client.force_authenticate(user=other_user)
        url = reverse('ads-detail', kwargs={'pk': ad.id})

        updated_data = {'title': 'Updated Title by other user'}
        response = self.client.patch(url, updated_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_ad_by_owner(self):
        # Test for deleting ad by its owner
        ad = Ad.objects.create(
            user=self.user,
            title='Test Delete',
            description='Test delete description',
            brand=self.brand,
            model=self.model,
            year=1987,
            mileage=30000,
            price=Decimal('50000.00'),
        )
        self.client.force_authenticate(user=self.user)
        url = reverse('ads-detail', kwargs={'pk': ad.id})

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Ad.objects.filter(id=ad.id).exists())

    def test_delete_ad_by_other_user(self):
        other_user = User.objects.create_user(
            email='other_user@email.com',
            username='other_user@email.com',
            password='321qwerty',
            first_name='Other',
            last_name='User',
            phone_number='+0987654321',
        )
        ad = Ad.objects.create(
            user=self.user,
            title='Test ad',
            description='Test description',
            brand=self.brand,
            model=self.model,
            year=1987,
            mileage=30000,
            price=Decimal('50000.00'),
        )

        self.client.force_authenticate(user=other_user)
        url = reverse('ads-detail', kwargs={'pk': ad.id})

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_filter_ads_by_price(self):
        # Test for filtering ads by minumum price
        Ad.objects.create(user=self.user, title='Some cheap car', brand=self.brand,
                          model=self.model, year=1985, mileage=100000, price=Decimal('15000'))
        Ad.objects.create(user=self.user, title='Some expensive car', brand=self.brand,
                          model=self.model, year=2025, mileage=100, price=Decimal('100000'))

        response = self.client.get(self.ad_list_url, {'price_min': 50000})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_search_ads_by_title(self):
        # Test for searching ads by title
        Ad.objects.create(user=self.user, title='Chevrolet Impala 1964', brand=self.brand,
                          model=self.model, year=1964, mileage=50000, price=Decimal('50000.00'))

        response = self.client.get(self.ad_list_url, {'search': 'impala'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_order_ads_by_price(self):
        # Test for ordering ads by price
        Ad.objects.create(user=self.user, title='Some expensive car', brand=self.brand,
                          model=self.model, year=2025, mileage=100, price=Decimal('100000'))
        Ad.objects.create(user=self.user, title='Some cheap car', brand=self.brand,
                          model=self.model, year=1985, mileage=100000, price=Decimal('15000'))

        response = self.client.get(self.ad_list_url, {'ordering': 'price'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(float(response.data['results'][0]['price']), 15000.00)

    def test_recent_ads(self):
        # Test for retrieving recent ads
        for i in range(16):
            Ad.objects.create(user=self.user, title=f'Car {i}', brand=self.brand,
                              model=self.model, year=2025, mileage=100, price=Decimal('100000'))

        url = reverse('ads-recent-ads')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 10)

    def test_pagination(self):
        # Test for pagination of ads
        for i in range(25):
            Ad.objects.create(user=self.user, title=f'Car {i}', brand=self.brand,
                              model=self.model, year=2025, mileage=100, price=Decimal('100000'))
        response = self.client.get(self.ad_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 16)
        self.assertIsNotNone(response.data.get('next'))


class FavouriteViewSetTests(APITestCase):
    """Test cases for FavouriteViewSet"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@email.com',
            username='test@email.com',
            password='321qwerty',
            first_name='Test',
            last_name='User',
            phone_number='+1234567890'
        )
        self.other_user = User.objects.create_user(
            email='otheruser@email.com',
            username='otheruser@email.com',
            password='321qwerty',
            first_name='Other',
            last_name='User',
            phone_number='+0987654321'
        )

        self.brand = Brand.objects.create(name='Buick')
        self.model = ModelCar.objects.create(
            name='Grand National', brand=self.brand)

        self.ad = Ad.objects.create(
            user=self.other_user,
            title='Black Grand National',
            description='All i ever wanted was a black Grand National',
            brand=self.brand,
            model=self.model,
            year=1987,
            mileage=30000,
            price=Decimal('50000.00'),
        )

        self.favourite_url = reverse('favourites-list')

    def test_add_to_favourites(self):
        # Test for adding ad to favourites
        self.client.force_authenticate(user=self.user)
        data = {'ad_id': self.ad.id}
        response = self.client.post(self.favourite_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Favourite.objects.filter(
            user=self.user, ad=self.ad).exists())

    def test_add_own_ad_to_favourites(self):
        # Test for adding your own ad to favourites
        self.client.force_authenticate(user=self.other_user)

        data = {'ad_id': self.ad.id}
        response = self.client.post(self.favourite_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_favourites(self):
        # Test for retrieving favourites list
        Favourite.objects.create(user=self.user, ad=self.ad)

        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.favourite_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_remove_from_favourites(self):
        # Test for removing ad from favourites:
        Favourite.objects.create(user=self.user, ad=self.ad)

        self.client.force_authenticate(user=self.user)
        url = reverse('favourites-detail', kwargs={'pk': self.ad.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Favourite.objects.filter(
            user=self.user, ad=self.ad).exists())

    def test_add_duplicate_favourite(self):
        # Test for adding duplicate favourite
        self.client.force_authenticate(user=self.user)
        data = {'ad_id': self.ad.id}

        response_1 = self.client.post(self.favourite_url, data, format='json')
        self.assertEqual(response_1.status_code, status.HTTP_201_CREATED)

        response_2 = self.client.post(self.favourite_url, data, format='json')
        self.assertEqual(response_2.status_code, status.HTTP_409_CONFLICT)

    def test_list_favourite_pagination(self):
        # Test for pagination in favourites
        for i in range(25):
            ad = Ad.objects.create(user=self.other_user, title=f'Car {i}', brand=self.brand,
                                   model=self.model, year=2025, mileage=100, price=Decimal('100000'))
            Favourite.objects.create(user=self.user, ad=ad)

        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.favourite_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 16)
        self.assertIsNotNone(response.data.get('next'))

    def test_remove_non_existent_favourite(self):
        # Test for removing a non existent favourite
        ad = Ad.objects.create(user=self.other_user, title='Another', brand=self.brand,
                               model=self.model, year=2025, mileage=100, price=Decimal('100000'))
        self.client.force_authenticate(user=self.user)
        url = reverse('favourites-detail', kwargs={'pk': ad.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class LocationAPITests(APITestCase):
    def setUp(self):
        self.url = reverse('search-location')
        self.rv_url = reverse('reverse-geocode')

    def test_search_location_with_short_query(self):
        # Test for searching location with less than 3 letters
        response = self.client.get(self.url, {'q': 'Ky'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)

    def test_search_location__with_empty_query(self):
        # Test for searching location with an empty query
        response = self.client.get(self.url, {'q': ''})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)

    def test_reverse_geocode_invalid_coordinates(self):
        # Test for reverse geocoding with invalid coordinates
        response = self.client.get(self.rv_url, {'lat': 91.0, 'lon': 30.0})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reverse_geocode_with_missing_parameters(self):
        # Test for reverse geocoding without parameters
        response = self.client.get(self.rv_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
