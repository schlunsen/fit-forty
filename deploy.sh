#!/bin/bash

# Production deployment script for FitForty

set -e

echo "🚀 Starting FitForty production deployment..."

# Check if .env.prod exists
if [ ! -f .env.prod ]; then
    echo "❌ Error: .env.prod file not found!"
    echo "📝 Please copy .env.production to .env.prod and fill in your production values."
    exit 1
fi

# Load environment variables
export $(cat .env.prod | grep -v '^#' | xargs)

echo "📦 Building production images..."

# Build the production images
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🛑 Stopping existing containers..."

# Stop and remove existing containers
docker-compose -f docker-compose.prod.yml down

echo "🗃️ Creating volumes and networks..."

# Create volumes if they don't exist
docker volume create workout_app_postgres_data || true
docker volume create workout_app_static_volume || true
docker volume create workout_app_media_volume || true
docker volume create workout_app_frontend_dist || true

echo "🚀 Starting production containers..."

# Start the containers
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services to be ready..."

# Wait for database to be ready
sleep 10

echo "🔧 Running database migrations..."

# Run migrations and collect static files
docker-compose -f docker-compose.prod.yml exec -T backend python manage.py migrate
docker-compose -f docker-compose.prod.yml exec -T backend python manage.py collectstatic --noinput

echo "📊 Checking service status..."

# Check if services are running
docker-compose -f docker-compose.prod.yml ps

echo "✅ Deployment completed!"
echo ""
echo "🔗 Your application should be available at: https://fitforty.schlunsen.com"
echo ""
echo "📋 To view logs, run:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛠️ To update your nginx configuration on the server:"
echo "   sudo cp nginx/production-server.conf /etc/nginx/sites-enabled/default"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo ""
echo "🔍 To monitor the application:"
echo "   docker-compose -f docker-compose.prod.yml ps"
echo "   docker-compose -f docker-compose.prod.yml logs -f [service_name]"