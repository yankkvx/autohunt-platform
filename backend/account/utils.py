import requests
from django.core.files.base import ContentFile
from django.utils.crypto import get_random_string


def download_profile_image(url, user):
    if not url:
        return
    try:
        response = requests.get(url)
        if response.status_code != 200:
            return
        content = response.content
        # Ignore default google images
        if content.startswith(b'\x89PNG'):
            return
        # Generate filename for user image
        file_name = f'{user.id}_{get_random_string(5)}_google_img.jpg'
        # Save imate to profile_image field
        user.profile_image.save(
            file_name, ContentFile(response.content), save=True)
    except Exception: 
        pass
