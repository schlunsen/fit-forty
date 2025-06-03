# Workout Tracker App

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
│   └── workouts/        # Workout tracking
├── frontend/            # Nuxt 3 frontend
│   ├── components/      # Reusable Vue components
│   ├── composables/     # Vue composables
│   ├── layouts/         # Page layouts
│   ├── pages/           # Application pages
│   ├── stores/          # Pinia stores
│   └── types/           # TypeScript type definitions
└── docker/              # Docker configuration files
```

## License

[MIT License](LICENSE)