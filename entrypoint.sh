#!/bin/bash

# Wait for database to be ready
echo "Waiting for database..."
sleep 10

# Make sure we have setuptools installed
pip install setuptools wheel

# Check if we need to install any new dependencies
if [ -f requirements.txt ]; then
    echo "Checking for new dependencies..."
    pip install -r requirements.txt
fi

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate --noinput || exit 1

# Create superuser
if [ "$DJANGO_SUPERUSER_USERNAME" ] && [ "$DJANGO_SUPERUSER_PASSWORD" ] && [ "$DJANGO_SUPERUSER_EMAIL" ]; then
    echo "Creating superuser..."
    python manage.py createsuperuser \
        --noinput \
        --username $DJANGO_SUPERUSER_USERNAME \
        --email $DJANGO_SUPERUSER_EMAIL || echo "Superuser already exists"
fi

# Create directories for static and media files
mkdir -p /app/static /app/media
chmod -R 755 /app/static /app/media

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput || exit 1

# Populate sample data if the flag is set
if [ "$LOAD_SAMPLE_DATA" = "True" ]; then
    echo "Creating sample exercises..."
    python manage.py create_sample_exercises || echo "Sample data may already exist"
fi

# Start server
echo "Starting server in $(if [ "$DEBUG" = "True" ]; then echo 'development'; else echo 'production'; fi) mode..."
exec "$@"