# Production Deployment Guide for FitForty

This guide covers deploying FitForty to production using Docker Compose with an external nginx proxy.

## Prerequisites

- Docker and Docker Compose installed on your production server
- Domain name pointing to your server (fitforty.schlunsen.com)
- SSL certificates configured with Let's Encrypt
- External nginx running on the host for SSL termination

## Quick Start

1. **Clone the repository** to your production server:
   ```bash
   git clone <repository-url>
   cd workout_app
   ```

2. **Create environment file**:
   ```bash
   cp .env.production .env.prod
   # Edit .env.prod with your production values
   nano .env.prod
   ```

3. **Update nginx configuration** on your server:
   ```bash
   sudo cp nginx/production-server.conf /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **Deploy the application**:
   ```bash
   ./deploy.sh
   ```

## Environment Configuration

### Required Environment Variables

Edit `.env.prod` with these required values:

```bash
# Django Settings (REQUIRED)
SECRET_KEY=your-very-secret-and-long-random-key-here
DB_PASSWORD=your-secure-database-password-here

# Admin User (REQUIRED for first deployment)
DJANGO_SUPERUSER_USERNAME=your-admin-username
DJANGO_SUPERUSER_PASSWORD=your-secure-admin-password
DJANGO_SUPERUSER_EMAIL=your-email@domain.com

# Optional (defaults shown)
ALLOWED_HOSTS=fitforty.schlunsen.com,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://fitforty.schlunsen.com
LOAD_SAMPLE_DATA=False
```

### Generate a Secret Key

You can generate a Django secret key using:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

## Architecture

The production setup includes:

- **PostgreSQL Database** (container)
- **Django Backend** (container with Gunicorn)
- **Nuxt Frontend** (built and served via nginx container)
- **Internal Nginx** (container, serves static files and proxies API)
- **External Nginx** (host, handles SSL and forwards to port 8000)

## File Upload Configuration

The application supports:
- Profile pictures (up to 10MB)
- Progress photos (up to 10MB)
- Files are stored in Docker volumes and served through nginx

## SSL and Security

The external nginx configuration includes:
- HTTP to HTTPS redirect
- Security headers (HSTS, CSP, etc.)
- Rate limiting for API endpoints
- Gzip compression
- Static file caching

## Management Commands

### View logs:
```bash
docker-compose -f docker-compose.prod.yml logs -f
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Access Django shell:
```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py shell
```

### Create superuser:
```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

### Run migrations:
```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

### Collect static files:
```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

### Update the application:
```bash
git pull
./deploy.sh
```

## Backup and Restore

### Backup database:
```bash
docker-compose -f docker-compose.prod.yml exec db pg_dump -U workout_user workout_db > backup.sql
```

### Restore database:
```bash
docker-compose -f docker-compose.prod.yml exec -T db psql -U workout_user workout_db < backup.sql
```

### Backup media files:
```bash
docker run --rm -v workout_app_media_volume:/data -v $(pwd):/backup alpine tar czf /backup/media-backup.tar.gz -C /data .
```

## Troubleshooting

### Check container status:
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Check container health:
```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py check
```

### Check nginx configuration:
```bash
sudo nginx -t
```

### View nginx access logs:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Restart services:
```bash
# Restart application
docker-compose -f docker-compose.prod.yml restart

# Restart nginx
sudo systemctl restart nginx
```

## Monitoring

You can monitor the application using:
- Container logs: `docker-compose -f docker-compose.prod.yml logs -f`
- Nginx logs: `/var/log/nginx/access.log` and `/var/log/nginx/error.log`
- Health check endpoint: `https://fitforty.schlunsen.com/health`

## Security Notes

1. **Never commit** `.env.prod` file to version control
2. **Change default passwords** immediately after deployment
3. **Regular updates** of Docker images and host system
4. **Monitor logs** for suspicious activity
5. **Regular backups** of database and media files

## Performance Tips

1. **Monitor resource usage**: `docker stats`
2. **Scale backend workers** if needed by adjusting `--workers` in docker-compose.prod.yml
3. **Use CDN** for static files in high-traffic scenarios
4. **Database tuning** for PostgreSQL if needed