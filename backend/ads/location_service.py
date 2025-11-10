import os
from dotenv import load_dotenv
import requests
from typing import Optional, Dict, List
import logging
from django.core.cache import cache

load_dotenv()

logger = logging.getLogger(__name__)


class LocationService:
    NOMINATIUM_URL = 'https://nominatim.openstreetmap.org/'

    HEADERS = {
        'User-Agent': os.getenv('USER_AGENT')
    }

    @classmethod
    def search_location(cls, query, limit=5) -> List[Dict]:
        # query - text for searching
        # limit - maximum numbers of result

        # Generate cache key based on search query
        cache_key = f"location_search{query.lower().replace(' ', '_')}"
        cached_result = cache.get(cache_key)

        if cached_result:
            return cached_result

        try:
            # Params for nomination API
            params = {
                'q': query,
                'format': 'json',
                'limit': limit,
                'addressdetails': 1,
                'accept-language': 'en',
            }

            response = requests.get(
                f"{cls.NOMINATIUM_URL}/search", params=params, headers=cls.HEADERS, timeout=5)
            response.raise_for_status()
            result = []

            # Convert response to normalized structure
            for i in response.json():
                location_data = {
                    'display_name': i.get('display_name'),
                    'latitude': float(i.get('lat')),
                    'longitude': float(i.get('lon')),
                    'address': {
                        'city': i.get('address', {}).get('city') or i.get('address', {}).get('town') or i.get('address', {}).get('village'),
                        'state': i.get('address', {}).get('state'),
                        'country': i.get('address', {}).get('country'),
                        'country_code': i.get('address', {}).get('country_code', '').upper(),
                        'postcode': i.get('address', {}).get('postcode')
                    },
                    'place_id': i.get('place_id'),
                    'osm_type': i.get('osm_type'),
                    'osm_id': i.get('osm_id')
                }
                result.append(location_data)

            # Cache result for 24 hours
            cache.set(cache_key, result, 86400)
            return result

        except requests.RequestException as e:
            logger.error(f'Error searching location: {e}')
            return []

    @classmethod
    def reverse_geocode(cls, latitude, longitude):
        # Convert coordinates to detailed location data

        cache_key = f"reverse_geocode_{latitude}_{longitude}"
        cached_result = cache.get(cache_key)

        if cached_result:
            return cached_result

        try:
            params = {
                'lat': latitude,
                'lon': longitude,
                'format': 'json',
                'addressdetails': 1
            }
            response = requests.get(
                f'{cls.NOMINATIUM_URL}/reverse', params=params, headers=cls.HEADERS, timeout=5)
            response.raise_for_status()

            data = response.json()

            if 'error' in data:
                return None

            location_data = {
                'display_name': data.get('display_name'),
                'latitude': float(data.get('lat')),
                'longitude': float(data.get('lon')),
                'address': {
                    'city': data.get('address', {}).get('city') or data.get('address', {}).get('town') or data.get('address', {}).get('village'),
                    'state': data.get('address', {}).get('state'),
                    'country': data.get('address', {}).get('country'),
                    'country_code': data.get('address', {}).get('country_code', '').upper(),
                    'postcode': data.get('address', {}).get('postcode')
                },
                'place_id': data.get('place_id'),
                'osm_type': data.get('osm_type'),
                'osm_id': data.get('osm_id')
            }

            cache.set(cache_key, location_data, 86400)
            return location_data

        except requests.RequestException as e:
            logger.error(f'Error reverse geocoding: {e}')
            return None

    @classmethod
    def get_coordinates(cls, location_str):
        # Returns only first result coordinates for a given location
        results = cls.search_location(location_str, limit=1)

        if results:
            return {
                'latitude': results[0]['latitude'],
                'longitude': results[0]['longitude']
            }
        return None

    @classmethod
    def validate_coordinates(cls, latitude, longitude):
        return (
            -90 <= latitude <= 90 and
            -180 <= longitude <= 180
        )
