import io
from PIL import Image, ImageDraw, ImageFont
from django.core.files.base import ContentFile
import os


MAX_IMAGE_SIZE = (1920, 1080)
MAX_FILE_SIZE = 10 * 1024 * 1024
WATERMARK_QUALITY = 85  # jpeg


def optimize_image_size(image, max_size=MAX_IMAGE_SIZE):
    """
    Resize image if it exceeds the maximum allowed size
    """
    # Check if image is already within in the allowed sizes
    if image.size[0] <= max_size[0] and image.size[1] <= max_size[1]:
        # if yes return the original image
        return image
    # if image is larger resize it
    image.thumbnail(max_size, Image.Resampling.LANCZOS)
    return image


def validate_image_file(uploaded_file):
    """
    Validate uploaded file to enstire is a proper image
    False, error message - validation fails
    True, None - validation succeds
    """
    # Check file size
    if uploaded_file.size > MAX_FILE_SIZE:
        return False, f'Maximum allowed size: {MAX_FILE_SIZE}'

    # Check file extension
    allowed_types = ['.jpg', '.jpeg', '.png', '.webp']
    file_type = os.path.splitext(uploaded_file.name)[1].lower()

    if file_type not in allowed_types:
        return False, f'Not valid file type. Allowed: {", ".join(allowed_types)}'

    # Verify file is a valid image
    try:
        uploaded_file.seek(0)
        with Image.open(uploaded_file) as img:
            img.verify()
        uploaded_file.seek(0)
    except Exception as e:
        return False, 'File is not an image.'

    return True, None


def add_watermark_to_image(image_file, watermark_text='AutoHunt', opacity=0.7):
    """
    Add a text watermark in the right-bottom corner of image
    """

    try:
        # Open an image
        with Image.open(image_file) as img:
            # Resize image if it is too large
            img = optimize_image_size(img)

            # Save the original mode
            original_mode = img.mode

            # Cjnvert image to RGBA
            if img.mode not in ('RGBA', 'LA'):
                if img.mode == 'P':
                    img = img.convert('RGBA')
                elif img.mode == 'RGB':
                    img = img.convert('RGBA')
                else:
                    img = img.convert('RGBA')

            # Create a transparent layer for drawing watermark
            watermark_img = Image.new('RGBA', img.size, (0, 0, 0, 0))
            draw = ImageDraw.Draw(watermark_img)

            # Get image dimensions
            img_width, img_height = img.size
            min_side = min(img_width, img_height)

            # Choose font size depending on image size
            if min_side <= 400:
                font_size = max(12, min_side // 25)
            elif min_side <= 800:
                font_size = max(18, min_side // 30)
            else:
                font_size = max(24, min_side // 36)

            try:
                font = ImageFont.truetype('arial.ttf', font_size)
            except (OSError, IOError):
                font = ImageFont.load_default()

            bbox = draw.textbbox((0, 0), watermark_text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]

            # Set margin for spacing from image edges
            margin_x = max(10, int(img_width * 0.05))
            margin_y = max(10, int(img_height * 0.05))

            # Coordinates for right bottom corner placement
            x = img_width - text_width - margin_x
            y = img_height - text_height - margin_y

            watermark_color = (255, 255, 255, int(255 * opacity))
            shadow_color = (0, 0, 0, int(255 * opacity * 0.5))

            draw.text((x+1, y+1), watermark_text, font=font, fill=shadow_color)
            draw.text((x, y), watermark_text, font=font, fill=watermark_color)

            # Put watermark layer on the original image
            watermarked_image = Image.alpha_composite(img, watermark_img)

            # Convert it back to original mode
            if original_mode != 'RGBA' and original_mode != 'LA':
                if original_mode == 'RGB':
                    watermarked_image = watermarked_image.convert('RGB')
                else:
                    pass
            return watermarked_image
    except Exception as e:
        raise Exception(f'Error: {e}')


def process_uploaded_image(image_file, watermark_text='AutoHunt', opacity=0.7):
    # Reset file pointer to the beginning of the file
    image_file.seek(0)
    # Aplly watermark using add_watermark_to_image function
    watermarked_image = add_watermark_to_image(
        image_file, watermark_text, opacity)

    return watermarked_image


def create_watermarked_file(uploaded_file, watermark_text='AutoHunt', opacity=0.7):
    """
    Validate an uploaded file, add watermark and return it as a new file.
    """
    # Validate the uploaded file to ensure it is a valid image
    is_valid, error_message = validate_image_file(uploaded_file)
    if not is_valid:
        raise ValueError(error_message)

    try:
        # Apply watermark to the uploaded image
        watermarked_image = process_uploaded_image(
            uploaded_file, watermark_text, opacity)

        # create an in memory buffer to store image
        buffer = io.BytesIO()

        file_type = os.path.splitext(uploaded_file.name)[1].lower()
        # Detect the original file type to determine output format
        if file_type in ['.jpg', '.jpeg']:
            format = 'JPEG'
            # JPEG doesnt support transparency
            if watermarked_image.mode == 'RGBA':
                background = Image.new(
                    'RGB', watermarked_image.size, (255, 255, 255))
                # Paste GRBA image onto the white background, saving transparency
                background.paste(watermarked_image,
                                 mask=watermarked_image.split()[-1])
                watermarked_image = background
        elif file_type == '.png':
            format = 'PNG'
        elif file_type == '.webp':
            format = 'WEBP'
        else:
            format = 'PNG'

        # Save option for pillow
        save_kwargs = {
            'format': format,
            'optimize': True,
        }

        # JPEG options for better compression and quality
        if format == 'JPEG':
            save_kwargs['quality'] = WATERMARK_QUALITY
            save_kwargs['progressive'] = True

        # Save the watermarked image to the buffer with settings
        watermarked_image.save(buffer, **save_kwargs)

        # Reset buffer
        buffer.seek(0)
        buffer_data = buffer.getvalue()

        # Wrap buffer content into a django content file, so it behaves, like an uploaded file
        new_file = ContentFile(buffer_data, name=uploaded_file.name)
        return new_file

    except Exception as e:
        raise Exception(f'Error: {e}')


def save_watermarked_image(watermarked_image, original_filename, upload_path):
    """
    Save a watermarked image to a given filepath
    """
    # Ensure the target directory exists or create it if its necessary
    os.makedirs(os.path.dirname(upload_path), exist_ok=True)

    # Extract the file type to detect the format
    file_type = os.path.splitext(original_filename)[1].lower()

    # Detect the original file type to determine output format
    if file_type in ['.jpg', '.jpeg']:
        format = 'JPEG'
        if watermarked_image.mode == 'RGBA':
            background = Image.new(
                'RGB', watermarked_image.size, (255, 255, 255))
            # Paste RGBA image onto white background using alpha channel as a mask
            background.paste(watermarked_image,
                             mask=watermarked_image.split()[-1])
            watermarked_image = background
    elif file_type == '.png':
        format = 'PNG'
    elif file_type == '.webp':
        format = 'WEBP'
    else:
        format = 'PNG'

    # Save options for pillow
    save_kwargs = {
        'format': format,
        'optimize': True,
    }
    # JPEG options for better comperssion and quality
    if format == 'JPEG':
        save_kwargs['quality'] = WATERMARK_QUALITY
        save_kwargs['progressive'] = True

    # Save image to the specified path with the selected format and options
    watermarked_image.save(upload_path, **save_kwargs)

    return upload_path
