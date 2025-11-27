from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from .models import Brand, ModelCar, BodyType, FuelType, DriveType, Transmission, Color, InteriorMaterial


User = get_user_model()


class BrandModelTests(TestCase):
    """Test cases for Brand model"""

    def test_create_brand(self):
        # Test for creating brand
        brand = Brand.objects.create(name='Buick')

        self.assertEqual(brand.name, 'Buick')
        self.assertEqual(str(brand), 'Buick')

    def test_brand_unique_name(self):
        # Test for unique brand name
        Brand.objects.create(name='Buick')

        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            Brand.objects.create(name='Buick')


class ModelModelTests(TestCase):
    """Test cases for ModelCar model"""

    def setUp(self):
        self.brand = Brand.objects.create(name='Buick')

    def test_create_model(self):
        # Test for creating car model
        model = ModelCar.objects.create(
            name='Grand National', brand=self.brand)

        self.assertEqual(model.name, 'Grand National')
        self.assertEqual(model.brand, self.brand)
        self.assertEqual(str(model), 'Buick - Grand National')

    def test_model_unique_together_constraint(self):
        # Test for unique pair (brand, name)
        ModelCar.objects.create(name='Grand National', brand=self.brand)

        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            ModelCar.objects.create(name='Grand National', brand=self.brand)

    def test_same_model_with_different_brand(self):
        # Test for creating same model with different brand

        another_brand = Brand.objects.create(name='Chevrolet')

        buick_gn = ModelCar.objects.create(
            name='Grand National', brand=self.brand)
        chevrolet_gn = ModelCar.objects.create(
            name='Grand National', brand=another_brand)

        self.assertNotEqual(buick_gn, chevrolet_gn)
        self.assertEqual(ModelCar.objects.filter(
            name='Grand National').count(), 2)


class BodyTypeModelTests(TestCase):
    """Test cases for BodyType model"""

    def test_create_body_type(self):
        # Test for creating body type model
        body_type = BodyType.objects.create(name='Coupe')

        self.assertEqual(body_type.name, 'Coupe')
        self.assertEqual(str(body_type), 'Coupe')

    def test_create_body_type_with_same_name(self):
        # Test for creating body type with existing name
        BodyType.objects.create(name='Coupe')

        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            BodyType.objects.create(name='Coupe')

    def test_body_type_ordering(self):
        # Test for ordering body types by name
        BodyType.objects.create(name='SUV')
        BodyType.objects.create(name='Coupe')
        BodyType.objects.create(name='Sedan')

        body_types = list(
            BodyType.objects.all().values_list('name', flat=True))
        self.assertEqual(body_types, ['Coupe', 'SUV', 'Sedan'])


class FuelTypeModelTests(TestCase):
    """Test cases for FuelType model"""

    def test_create_fuel_type(self):
        # Test for creating fuel type
        fuel = FuelType.objects.create(name='Electric')
        self.assertEqual(fuel.name, 'Electric')
        self.assertEqual(str(fuel), 'Electric')

    def test_create_fuel_type_with_same_name(self):
        # Test for creating fuel type with existing name
        FuelType.objects.create(name='Electric')

        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            FuelType.objects.create(name='Electric')


class DriveTypeModelTests(TestCase):
    """Test cases for DriveType model"""

    def test_create_drive_type(self):
        # Test for creating drive type
        drive = DriveType.objects.create(name='AWD')
        self.assertEqual(drive.name, 'AWD')
        self.assertEqual(str(drive), 'AWD')

    def test_create_drive_type_with_same_name(self):
        # Test for creating drive type with existing name
        DriveType.objects.create(name='AWD')

        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            DriveType.objects.create(name='AWD')


class TransmissionModelTests(TestCase):
    """Test cases for transmissions model"""

    def test_create_transmission(self):
        # Test for creating transmission
        transmission = Transmission.objects.create(name='Manual')
        self.assertEqual(transmission.name, 'Manual')
        self.assertEqual(str(transmission), 'Manual')

    def test_create_transmission_with_same_name(self):
        # Test for creating transmission with existing name
        Transmission.objects.create(name='Manual')

        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            Transmission.objects.create(name='Manual')


class ColorModelTests(TestCase):
    """Test cases for Color model"""

    def test_create_color(self):
        # Test for creating color
        color = Color.objects.create(name='Black')
        self.assertEqual(color.name, 'Black')
        self.assertEqual(str(color), 'Black')

    def test_create_color_with_same_name(self):
        # Test for creating color with existing name
        Color.objects.create(name='Black')

        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            Color.objects.create(name='Black')


class InteriorMaterialModelTests(TestCase):
    """Test cases for InteriorMaterial model"""

    def test_create_interior_material(self):
        # Test for creating interior material
        interior_material = InteriorMaterial.objects.create(name='Leather')
        self.assertEqual(interior_material.name, 'Leather')
        self.assertEqual(str(interior_material), 'Leather')

    def test_create_interior_material_with_same_name(self):
        InteriorMaterial.objects.create(name='Leather')

        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            InteriorMaterial.objects.create(name='Leather')


class BrandViewSetTests(APITestCase):
    """Test cases for brands API"""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            email='admin@email.com',
            password='321qwerty',
        )
        self.default_user = User.objects.create_user(
            email='user@email.com',
            username='user@email.com',
            password='321qwerty',
            first_name='Default',
            last_name='User'
        )

        self.brand = Brand.objects.create(name='Buick')
        self.brand_url = reverse('brand-list')

    def test_list_brands_unauthenticated(self):
        # Test for getting brands list without authorization
        response = self.client.get(self.brand_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_brand_unauthenticated(self):
        # Test for getting specific brand without authorization
        url = reverse('brand-detail', kwargs={'pk': self.brand.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Buick')

    def test_create_brand_as_admin(self):
        # Test for creating brand as admin user
        self.client.force_authenticate(user=self.admin_user)

        data = {'name': 'Chevrolet'}
        response = self.client.post(self.brand_url, data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Chevrolet')
        self.assertTrue(Brand.objects.filter(name='Chevrolet').exists())

    def test_create_brand_as_default_user(self):
        # Test for creating brand as default user
        self.client.force_authenticate(user=self.default_user)

        data = {'name': 'Chevrolet'}
        response = self.client.post(self.brand_url, data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_brand_as_admin(self):
        # Test for updating brand as admin user
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('brand-detail', kwargs={'pk': self.brand.id})
        data = {'name': 'Chevrolet Updated'}
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Chevrolet Updated')

    def test_delete_brand_as_admin(self):
        # Test for deleting brand as admin user
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('brand-detail', kwargs={'pk': self.brand.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Brand.objects.filter(id=self.brand.id).exists())


class ModelCarViewSetTests(APITestCase):
    """Test cases for ModelCar API"""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            email='admin@email.com',
            password='321qwerty'
        )

        self.default_user = User.objects.create_user(
            email='user@email.com',
            username='user@email.com',
            password='321qwerty',
            first_name='Default',
            last_name='User'
        )

        self.brand = Brand.objects.create(name='Buick')
        self.model = ModelCar.objects.create(
            name='Grand National', brand=self.brand)
        self.models_url = reverse('modelcar-list')

    def test_list_models_unauthenticated(self):
        # Test for getting models list without authorization
        response = self.client.get(self.models_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_model_as_admin(self):
        # Test for creating model as admin user
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'name': 'Regal',
            'brand_id': self.brand.id
        }
        response = self.client.post(self.models_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Regal')
        self.assertTrue(ModelCar.objects.filter(
            name='Regal').exists())

    def test_create_model_as_default_user(self):
        # Test for creating model as default user
        self.client.force_authenticate(user=self.default_user)

        data = {'name': 'Regal'}
        response = self.client.post(self.models_url, data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_model_with_non_existent_brand(self):
        # Test for creating model with nonexisting brand
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'name': 'Regal',
            'brand_id': 123123,
        }
        response = self.client.post(self.models_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_model_as_admin(self):
        # Test for updating model as admin user
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('modelcar-detail', kwargs={'pk': self.model.id})
        data = {'name': 'Regal Updated', 'brand_id': self.brand.id}
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Regal Updated')

    def test_update_model_as_default_user(self):
        # Test for updating model as default user
        self.client.force_authenticate(user=self.default_user)
        url = reverse('modelcar-detail', kwargs={'pk': self.model.id})
        data = {'name': 'Regal Updated', 'brand_id': self.brand.id}
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_model_as_admin(self):
        # Test for deleting model as admin user
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('modelcar-detail', kwargs={'pk': self.model.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ModelCar.objects.filter(id=self.model.id).exists())

    def test_delete_model_as_default_user(self):
        # Test for deleting model as default user
        self.client.force_authenticate(user=self.default_user)
        url = reverse('modelcar-detail', kwargs={'pk': self.model.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class BodyTypeViewSetTests(APITestCase):
    """Test cases for body types API"""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            email='admin@email.com',
            password='321qwerty'
        )
        self.default_user = User.objects.create_user(
            email='user@email.com',
            username='user@email.com',
            password='321qwerty',
            first_name='Default',
            last_name='User'
        )
        self.body_type = BodyType.objects.create(name='Coupe')
        self.body_type_url = reverse('bodytype-list')

    def test_list_body_types(self):
        # Test for getting body types list
        response = self.client.get(self.body_type_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_body_type_as_admin(self):
        # Test for creating body type as admin user
        self.client.force_authenticate(user=self.admin_user)
        data = {'name': 'SUV'}
        response = self.client.post(self.body_type_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'SUV')

    def test_create_body_type_as_default_user(self):
        # Test for creating body type as default user
        self.client.force_authenticate(user=self.default_user)

        data = {'name': 'SUV'}
        response = self.client.post(
            self.body_type_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_body_type_as_admin(self):
        # Test for updating body_type as admin user
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('bodytype-detail', kwargs={'pk': self.body_type.id})
        data = {'name': 'Coupe Updated'}
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Coupe Updated')

    def test_update_body_type_as_default_user(self):
        # Test for updating body type as default user
        self.client.force_authenticate(user=self.default_user)
        url = reverse('bodytype-detail', kwargs={'pk': self.body_type.id})
        data = {'name': 'Coupe Updated'}
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_body_type_as_admin(self):
        # Test for deleting body type as admin user
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('bodytype-detail', kwargs={'pk': self.body_type.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(BodyType.objects.filter(
            id=self.body_type.id).exists())

    def test_delete_body_type_as_default_user(self):
        # Test for deleting body type as default user
        self.client.force_authenticate(user=self.default_user)
        url = reverse('bodytype-detail', kwargs={'pk': self.body_type.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class FuelTypeViewSetTests(APITestCase):
    """Test cases for fuel types API"""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            email='admin@email.com',
            password='321qwerty'
        )
        self.default_user = User.objects.create_user(
            email='user@email.com',
            username='user@email.com',
            password='321qwerty',
            first_name='Default',
            last_name='User'
        )
        self.fuel_type = FuelType.objects.create(name='Electric')
        self.fuel_type_url = reverse('fueltype-list')

    def test_list_fuel_types(self):
        # Test for getting fuel types list
        response = self.client.get(self.fuel_type_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_fuel_type_as_admin(self):
        # Test for creating fuel type as admin user
        self.client.force_authenticate(user=self.admin_user)
        data = {'name': 'Hybrid'}
        response = self.client.post(self.fuel_type_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Hybrid')

    def test_create_fuel_type_as_default_user(self):
        # Test for creating fuel type as default user
        self.client.force_authenticate(user=self.default_user)

        data = {'name': 'Hybrid'}
        response = self.client.post(
            self.fuel_type_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_fuel_type_as_admin(self):
        # Test for updating fuel type as admin user
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('fueltype-detail', kwargs={'pk': self.fuel_type.id})
        data = {'name': 'Electric Updated'}
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Electric Updated')

    def test_update_fuel_type_as_default_user(self):
        # Test for updating fuel type as default user
        self.client.force_authenticate(user=self.default_user)
        url = reverse('fueltype-detail', kwargs={'pk': self.fuel_type.id})
        data = {'name': 'Electric Updated'}
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_fuel_type_as_admin(self):
        # Test for deleting fuel type as admin user
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('fueltype-detail', kwargs={'pk': self.fuel_type.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(FuelType.objects.filter(
            id=self.fuel_type.id).exists())

    def test_delete_fuel_type_as_default_user(self):
        # Test for deleting fuel type as default user
        self.client.force_authenticate(user=self.default_user)
        url = reverse('fueltype-detail', kwargs={'pk': self.fuel_type.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class DriveTypeViewSetTests(APITestCase):
    """Test cases for drive types API"""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            email='admin@email.com',
            password='321qwerty'
        )
        self.default_user = User.objects.create_user(
            email='user@email.com',
            username='user@email.com',
            password='321qwerty',
            first_name='Default',
            last_name='User'
        )
        self.drive_type = DriveType.objects.create(name='AWD')
        self.drive_type_url = reverse('drivetype-list')

    def test_list_drive_types(self):
        # Test for getting drive types list
        response = self.client.get(self.drive_type_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_drive_type_as_admin(self):
        # Test for creating drive type as admin user
        self.client.force_authenticate(user=self.admin_user)
        data = {'name': 'RWD'}
        response = self.client.post(self.drive_type_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'RWD')

    def test_create_drive_type_as_default_user(self):
        # Test for creating drive type as default user
        self.client.force_authenticate(user=self.default_user)

        data = {'name': 'FWD'}
        response = self.client.post(
            self.drive_type_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_drive_type_as_admin(self):
        # Test for updating drive type as admin user
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('drivetype-detail', kwargs={'pk': self.drive_type.id})
        data = {'name': 'AWD Updated'}
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'AWD Updated')

    def test_update_drive_type_as_default_user(self):
        # Test for updating drive type as default user
        self.client.force_authenticate(user=self.default_user)
        url = reverse('drivetype-detail', kwargs={'pk': self.drive_type.id})
        data = {'name': 'AWD Updated'}
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_drive_type_as_admin(self):
        # Test for deleting drive type as admin user
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('drivetype-detail', kwargs={'pk': self.drive_type.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(DriveType.objects.filter(
            id=self.drive_type.id).exists())

    def test_delete_drive_type_as_default_user(self):
        # Test for deleting drive type as default user
        self.client.force_authenticate(user=self.default_user)
        url = reverse('drivetype-detail', kwargs={'pk': self.drive_type.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class TransmissionViewSetTests(APITestCase):
    """Test cases for transimssions API"""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            email='admin@email.com',
            password='321qwerty'
        )
        self.default_user = User.objects.create_user(
            email='user@email.com',
            username='user@email.com',
            password='321qwerty',
            first_name='Default',
            last_name='User'
        )
        self.transmission = Transmission.objects.create(name='Manual')
        self.transmission_url = reverse('transmission-list')

    def test_list_transmissions(self):
        # Test for getting transmissions list
        response = self.client.get(self.transmission_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_transmission_as_admin(self):
        # Test for creating transmission as admin user
        self.client.force_authenticate(user=self.admin_user)
        data = {'name': 'Automatic'}
        response = self.client.post(self.transmission_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Automatic')

    def test_create_drive_type_as_default_user(self):
        # Test for creating transmission as default user
        self.client.force_authenticate(user=self.default_user)

        data = {'name': 'CVT'}
        response = self.client.post(
            self.transmission_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_transmission_as_admin(self):
        # Test for updating transmission as admin user
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('transmission-detail',
                      kwargs={'pk': self.transmission.id})
        data = {'name': 'Manual Updated'}
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Manual Updated')

    def test_update_transmission_as_default_user(self):
        # Test for updating transmission as default user
        self.client.force_authenticate(user=self.default_user)
        url = reverse('transmission-detail',
                      kwargs={'pk': self.transmission.id})
        data = {'name': 'Manual Updated'}
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_transmission_as_admin(self):
        # Test for deleting transmission as admin user
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('transmission-detail',
                      kwargs={'pk': self.transmission.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Transmission.objects.filter(
            id=self.transmission.id).exists())

    def test_delete_transmission_as_default_user(self):
        # Test for deleting transmission as default user
        self.client.force_authenticate(user=self.default_user)
        url = reverse('transmission-detail',
                      kwargs={'pk': self.transmission.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ColorViewSetTests(APITestCase):
    """Test cases for colors API"""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            email='admin@email.com',
            password='321qwerty'
        )
        self.default_user = User.objects.create_user(
            email='user@email.com',
            username='user@email.com',
            password='321qwerty',
            first_name='Default',
            last_name='User'
        )
        self.color = Color.objects.create(name='Black')
        self.color_url = reverse('color-list')

    def test_list_colors(self):
        # Test for getting colors list
        response = self.client.get(self.color_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_color_as_admin(self):
        # Test for creating color as admin user
        self.client.force_authenticate(user=self.admin_user)

        data = {'name': 'White'}
        response = self.client.post(self.color_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'White')

    def test_create_color_as_default_user(self):
        # Test for creating color as default user
        self.client.force_authenticate(user=self.default_user)
        data = {'name': 'White'}
        response = self.client.post(self.color_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_color_as_admin(self):
        # Test for updating color as admin user
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('color-detail',
                      kwargs={'pk': self.color.id})
        data = {'name': 'Black Updated'}
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Black Updated')

    def test_update_color_as_default_user(self):
        # Test for updating color as default user
        self.client.force_authenticate(user=self.default_user)
        url = reverse('color-detail',
                      kwargs={'pk': self.color.id})
        data = {'name': 'Black Updated'}
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_color_as_admin(self):
        # Test for deleting color as admin user
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('color-detail',
                      kwargs={'pk': self.color.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Color.objects.filter(
            id=self.color.id).exists())

    def test_delete_color_as_default_user(self):
        # Test for deleting color as default user
        self.client.force_authenticate(user=self.default_user)
        url = reverse('color-detail',
                      kwargs={'pk': self.color.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class InteriorMaterialViewSetTests(APITestCase):
    """Test cases for interior materials API"""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            email='admin@email.com',
            password='321qwerty'
        )
        self.default_user = User.objects.create_user(
            email='user@email.com',
            username='user@email.com',
            password='321qwerty',
            first_name='Default',
            last_name='User'
        )
        self.interior_material = InteriorMaterial.objects.create(
            name='Leather')
        self.interior_material_url = reverse('interiormaterial-list')

    def test_list_interior_materials(self):
        # Test for getting interior materials list
        response = self.client.get(self.interior_material_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_interior_material_as_admin(self):
        # Test for creating interior material as admin user
        self.client.force_authenticate(user=self.admin_user)

        data = {'name': 'Fabric'}
        response = self.client.post(
            self.interior_material_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Fabric')

    def test_create_interior_material_as_default_user(self):
        # Test for creating interior material as default user
        self.client.force_authenticate(user=self.default_user)
        data = {'name': 'Fabric'}
        response = self.client.post(
            self.interior_material_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_interior_material_as_admin(self):
        # Test for updating interior material as admin user
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('interiormaterial-detail',
                      kwargs={'pk': self.interior_material.id})
        data = {'name': 'Leather Updated'}
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Leather Updated')

    def test_update_interior_material_as_default_user(self):
        # Test for updating interior material as default user
        self.client.force_authenticate(user=self.default_user)
        url = reverse('interiormaterial-detail',
                      kwargs={'pk': self.interior_material.id})
        data = {'name': 'Leather Updated'}
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_interior_material_as_admin(self):
        # Test for deleting interior material as admin user
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('interiormaterial-detail',
                      kwargs={'pk': self.interior_material.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(InteriorMaterial.objects.filter(
            id=self.interior_material.id).exists())

    def test_delete_interior_material_as_default_user(self):
        # Test for deleting interior material as default user
        self.client.force_authenticate(user=self.default_user)
        url = reverse('interiormaterial-detail',
                      kwargs={'pk': self.interior_material.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class CatalogIntegrationTests(APITestCase):
    """Integration tests for catalog"""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            email='admin@email.com',
            password='321qwerty'
        )
        self.client.force_authenticate(user=self.admin_user)

    def test_create_complete_catalog_structure(self):
        # Test for creating full structure catalog

        # Brand creating
        brand_url = reverse('brand-list')
        brand_data = {'name': 'Buick'}
        brand_response = self.client.post(brand_url, brand_data, format='json')
        brand_id = brand_response.data['id']

        # Model creating
        model_url = reverse('modelcar-list')
        model_data = {'name': 'Grand National', 'brand_id': brand_id}
        model_response = self.client.post(model_url, model_data, format='json')

        # Body type creating
        body_type_url = reverse('bodytype-list')
        body_type_data = {'name': 'Coupe'}
        body_type_response = self.client.post(
            body_type_url, body_type_data, format='json')

        # Fuel type creating
        fuel_type_url = reverse('fueltype-list')
        fuel_type_data = {'name': 'Petrol'}
        fuel_type_response = self.client.post(
            fuel_type_url, fuel_type_data, format='json')

        # Drive type creating
        drive_type_url = reverse('drivetype-list')
        drive_type_data = {'name': 'RWD'}
        drive_type_response = self.client.post(
            drive_type_url, drive_type_data, format='json')

        # Transmission creaing
        transmission_url = reverse('transmission-list')
        transmission_data = {'name': '4-speed automatic'}
        transmission_response = self.client.post(
            transmission_url, transmission_data, format='json')

        # Color creating
        color_url = reverse('color-list')
        color_data = {'name': 'Black'}
        color_response = self.client.post(color_url, color_data, format='json')

        # Interior material creating
        interior_material_url = reverse('interiormaterial-list')
        interior_material_data = {'name': 'Leather'}
        interior_material_response = self.client.post(
            interior_material_url, interior_material_data, format='json')

        # Checking that everything was created successfully
        self.assertEqual(brand_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(model_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(body_type_response.status_code,
                         status.HTTP_201_CREATED)
        self.assertEqual(fuel_type_response.status_code,
                         status.HTTP_201_CREATED)
        self.assertEqual(drive_type_response.status_code,
                         status.HTTP_201_CREATED)
        self.assertEqual(transmission_response.status_code,
                         status.HTTP_201_CREATED)
        self.assertEqual(color_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(interior_material_response.status_code,
                         status.HTTP_201_CREATED)
