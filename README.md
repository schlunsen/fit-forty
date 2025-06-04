# Workout Tracker App

[![CI/CD Pipeline](https://github.com/schlunsen/fit-forty/actions/workflows/django-tests.yml/badge.svg)](https://github.com/schlunsen/fit-forty/actions/workflows/django-tests.yml)
[![Docker Images](https://img.shields.io/badge/Docker-GHCR-blue?logo=docker)](https://github.com/schlunsen/fit-forty/pkgs/container/workout_app%2Fbackend)

A full-stack application for tracking workouts, health metrics, and progress photos built with Django REST Framework and Nuxt 3.

## Features

- **Workout Tracking**: Log exercises, sets, reps, and weights
- **Health Metrics**: Monitor weight and blood pressure over time
- **Progress Photos**: Upload and categorize photos by body part
- **User Authentication**: Secure login and registration
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Backend
- Django
- Django REST Framework
- PostgreSQL
- JWT Authentication

### Frontend
- Nuxt 3
- Vue 3 (Composition API)
- TypeScript
- Pinia for state management
- Tailwind CSS for styling
- Chart.js for data visualization

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js (for local development)
- Python (for local development)

### Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/workout-app.git
   cd workout-app
   ```

2. Start the application with Docker Compose:
   ```
   docker-compose up
   ```

3. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api

## 🚀 Production Deployment

For production deployment using pre-built Docker images from GitHub Container Registry:

📖 **[See DEPLOYMENT.md](DEPLOYMENT.md)** for comprehensive deployment instructions including:
- Using pre-built Docker images from GHCR
- Kubernetes deployment examples
- Cloud platform deployment (Google Cloud Run, AWS ECS)
- Environment configuration
- Monitoring and troubleshooting

### Quick Production Start
```bash
# Using pre-built images from GitHub Container Registry
export GITHUB_REPOSITORY=your-username/workout_app
docker-compose -f docker-compose.ghcr.yml up -d
```

### Development with Hot Reloading

Both the frontend and backend are configured with volume mounts to support live code reloading:

- Frontend changes will automatically trigger a refresh
- Backend changes will be detected and the server will restart

## Project Structure

```
workout_app/
├── backend/             # Django REST Framework backend
│   ├── accounts/        # User authentication and profiles
│   ├── api/             # API views and serializers
│   ├── exercises/       # Exercise management
│   ├── health/          # Health metrics tracking
│   ├── tests/           # Test suite
│   └── workouts/        # Workout tracking
├── frontend/            # Nuxt 3 frontend
│   ├── components/      # Reusable Vue components
│   ├── composables/     # Vue composables
│   ├── layouts/         # Page layouts
│   ├── pages/           # Application pages
│   ├── stores/          # Pinia stores
│   └── types/           # TypeScript type definitions
├── docker/              # Docker configuration files
└── .github/             # GitHub Actions workflows
```

## Testing

### Backend Tests

The backend includes comprehensive tests for models, APIs, and permissions that ensure:

- Users can only access their own data
- CRUD operations are properly restricted by user ownership
- API endpoints enforce proper authentication and authorization

To run the tests:

```bash
cd backend
python manage.py test
```

For more detailed testing information, see [backend/tests.md](backend/tests.md).

## Continuous Integration

This project uses GitHub Actions for continuous integration:

- All tests are automatically run on every commit
- Test status is displayed in the badge at the top of this README

## License

[MIT License](LICENSE)