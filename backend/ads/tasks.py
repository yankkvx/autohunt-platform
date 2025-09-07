import logging
from celery import shared_task
from django.core.files.storage import default_storage
from .utils import create_watermarked_file, validate_image_file
from .models import AdImage

logger = logging.getLogger(__name__)


@shared_task(name='ads.tasks.process_image_watermark')
def process_image_watermark(image_id, watermark_text='AutoHunt', opacity=0.7):
    """
    Celery task that applies watermark to an uploaded image
    """
    try:
        ad_image = AdImage.objects.get(id=image_id)
        if not ad_image:
            logger.error('Image not found.')
            return
        # Open the image in binary mode
        image_file = ad_image.image.open('rb')

        # Validate the image using validate_image_file function
        is_valid, error_message = validate_image_file(image_id)
        if not is_valid:
            logger.error(
                f'Invalid image with id={image_id}: {error_message}')
            return

        # Generate a watermarked copy of the image
        watermarked_file = create_watermarked_file(
            image_file, watermark_text, opacity)

        # Create a new filename for the watermarked image
        original_name = ad_image.image.name
        name_parts = original_name.splitext(original_name)
        new_name = f'{name_parts[0]}_watermarked{name_parts[1]}'

        # Save the new watermarked image using django storafe
        saved_path = default_storage.save(new_name, watermarked_file)

        # Update the db record to point to the new file
        ad_image.image = saved_path
        ad_image.save()

        logger.info(f'Image with {image_id} id was watermarked.')
    except AdImage.DoesNotExist:
        logger(f'Image with id={image_id} does not exist.')
    except Exception as e:
        logger.error(f'Error with {image_id} id: {str(e)}')
