FROM python:3.11-slim

# Install system dependencies for building python packages
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libjpeg-dev \
    libpng-dev \
    libfreetype6-dev \
    liblcms2-dev \
    libwebp-dev \
    libharfbuzz-dev \
    libfribidi-dev \
    libxcb1-dev \
    && rm -rf /var/lib/apt/lists/*

# Set the working dir inside the container
WORKDIR /app

# Copy dependencies 
COPY requirements.txt .

# Install python dependencies without cache to redduce image size
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY . .

# Create non-root user and set ownership
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app

# Switch for non-root user
USER app

# Dir for statics
RUN mkdir -p /app/static/images

# Open the port that django sserver will run on
EXPOSE 8000

# Set the default command to run django server
CMD ['python', 'manage.py', 'runserver', '0.0.0.0:8000']