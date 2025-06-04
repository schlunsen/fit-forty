# Deployment Guide

This guide covers how to deploy the Workout & Health Tracker application using pre-built Docker images from GitHub Container Registry.

## 🐳 Using Pre-built Images from GitHub Container Registry

The application automatically builds and publishes Docker images to GitHub Container Registry (GHCR) on every push to the main branch.

### Available Images

- **Backend:** `ghcr.io/your-username/workout_app/backend:latest`
- **Frontend:** `ghcr.io/your-username/workout_app/frontend:latest`

### Quick Start with Pre-built Images

1. **Clone the repository (for config files):**
   ```bash
   git clone https://github.com/your-username/workout_app.git
   cd workout_app
   ```

2. **Set up environment variables:**
   ```bash
   # Copy and edit the environment file
   cp .env.example .env
   
   # Edit .env with your production values
   nano .env
   ```

3. **Deploy using pre-built images:**
   ```bash
   # Option 1: Using docker-compose with GHCR images
   export GITHUB_REPOSITORY=your-username/workout_app
   export IMAGE_TAG=latest
   docker-compose -f docker-compose.ghcr.yml up -d
   
   # Option 2: Pull and run manually
   docker pull ghcr.io/your-username/workout_app/backend:latest
   docker pull ghcr.io/your-username/workout_app/frontend:latest
   ```

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Database
DB_PASSWORD=your_secure_password

# Django
SECRET_KEY=your_super_secret_key_here
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_PASSWORD=your_admin_password
DJANGO_SUPERUSER_EMAIL=admin@yourdomain.com

# Hosts
ALLOWED_HOSTS=yourdomain.com,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Optional
LOAD_SAMPLE_DATA=True
GITHUB_REPOSITORY=your-username/workout_app
IMAGE_TAG=latest
```

## 🏗️ CI/CD Pipeline

The GitHub Actions workflow automatically:

1. **Runs Tests:** Django tests with PostgreSQL
2. **Builds Images:** Multi-architecture (AMD64/ARM64) Docker images
3. **Pushes to Registry:** Images are tagged and pushed to GHCR
4. **Generates Summary:** Build summary with pull commands

### Image Tagging Strategy

Images are tagged with:
- `latest` - Latest stable release (main branch)
- `main-<commit-sha>` - Specific commit from main branch
- `<branch-name>` - Feature/bugfix branches

### Multi-Architecture Support

Images are built for:
- `linux/amd64` (Intel/AMD x64)
- `linux/arm64` (ARM 64-bit, Apple Silicon)

## 🚀 Production Deployment

### Option 1: Docker Compose with GHCR Images

```bash
# Set environment variables
export GITHUB_REPOSITORY=your-username/workout_app
export IMAGE_TAG=latest

# Deploy
docker-compose -f docker-compose.ghcr.yml up -d
```

### Option 2: Kubernetes

```yaml
# Example Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: workout-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: workout-backend
  template:
    metadata:
      labels:
        app: workout-backend
    spec:
      containers:
      - name: backend
        image: ghcr.io/your-username/workout_app/backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: workout-secrets
              key: secret-key
```

### Option 3: Cloud Platforms

#### Google Cloud Run
```bash
# Deploy backend
gcloud run deploy workout-backend \
  --image ghcr.io/your-username/workout_app/backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Deploy frontend  
gcloud run deploy workout-frontend \
  --image ghcr.io/your-username/workout_app/frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### AWS ECS/Fargate
```json
{
  "family": "workout-app",
  "taskDefinition": {
    "containerDefinitions": [
      {
        "name": "backend",
        "image": "ghcr.io/your-username/workout_app/backend:latest",
        "portMappings": [
          {
            "containerPort": 8000,
            "protocol": "tcp"
          }
        ]
      }
    ]
  }
}
```

## 🔐 Authentication with GHCR

### For Public Repositories
No authentication required for pulling public images.

### For Private Repositories
```bash
# Create a personal access token with packages:read scope
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull images
docker pull ghcr.io/your-username/workout_app/backend:latest
```

## 📊 Monitoring and Logs

### View running containers
```bash
docker-compose -f docker-compose.ghcr.yml ps
```

### View logs
```bash
# All services
docker-compose -f docker-compose.ghcr.yml logs -f

# Specific service
docker-compose -f docker-compose.ghcr.yml logs -f backend
```

### Health checks
```bash
# Check backend health
curl http://localhost:8000/admin/

# Check database
docker-compose -f docker-compose.ghcr.yml exec db pg_isready -U workout_user
```

## 🔄 Updates and Rollbacks

### Update to latest images
```bash
# Pull latest images
docker-compose -f docker-compose.ghcr.yml pull

# Restart services
docker-compose -f docker-compose.ghcr.yml up -d
```

### Rollback to previous version
```bash
# Use specific tag
export IMAGE_TAG=main-abc123def
docker-compose -f docker-compose.ghcr.yml up -d
```

## 🛠️ Troubleshooting

### Common Issues

1. **Image pull errors:**
   ```bash
   # Check if image exists
   docker manifest inspect ghcr.io/your-username/workout_app/backend:latest
   ```

2. **Permission errors:**
   ```bash
   # Check GHCR authentication
   docker login ghcr.io
   ```

3. **Container startup issues:**
   ```bash
   # Check logs
   docker-compose -f docker-compose.ghcr.yml logs backend
   ```

### Development vs Production

- **Development:** Use `docker-compose.yml` (builds locally)
- **Production:** Use `docker-compose.ghcr.yml` (pulls from registry)

For more deployment options and advanced configurations, see the main [README.md](README.md).