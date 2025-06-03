# PostgreSQL Setup Guide

This guide provides instructions for setting up PostgreSQL for the Workout & Health Tracking App.

## Local Development

### Installation

#### macOS (using Homebrew)
```bash
brew install postgresql
brew services start postgresql
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Windows
1. Download the installer from [PostgreSQL Website](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the instructions
3. Add PostgreSQL bin directory to your PATH environment variable

### Database Setup

1. Connect to PostgreSQL:
```bash
# macOS/Linux
sudo -u postgres psql

# Windows (after installation)
psql -U postgres
```

2. Create a database and user:
```sql
CREATE DATABASE workout_db;
CREATE USER workout_user WITH PASSWORD 'your_secure_password';
ALTER ROLE workout_user SET client_encoding TO 'utf8';
ALTER ROLE workout_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE workout_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE workout_db TO workout_user;
```

3. Exit PostgreSQL:
```sql
\q
```

### Configure Django Settings

1. Update the database settings in `workout_backend/settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'workout_db',
        'USER': 'workout_user',
        'PASSWORD': 'your_secure_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

2. For security, it's recommended to use environment variables for sensitive information:
```python
import os
from dotenv import load_dotenv

load_dotenv()

# ...

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'workout_db'),
        'USER': os.environ.get('DB_USER', 'workout_user'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'your_secure_password'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}
```

3. Create a `.env` file in the project root:
```
DB_NAME=workout_db
DB_USER=workout_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
```

## Production Setup

For production environments, consider the following additional steps:

1. Use a strong, randomly generated password
2. Configure SSL for database connections
3. Set up regular database backups
4. Consider using a managed PostgreSQL service (AWS RDS, DigitalOcean Managed Databases, etc.)

### Production Database Configuration

Add these additional settings to secure your database in production:

```python
# Add to settings.py for production
if not DEBUG:
    DATABASES['default']['OPTIONS'] = {
        'sslmode': 'require',
    }
```

### Using Environment Variables with Docker

If deploying with Docker, pass environment variables through docker-compose:

```yaml
# docker-compose.yml
version: '3'

services:
  db:
    image: postgres:14
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    environment:
      - POSTGRES_DB=workout_db
      - POSTGRES_USER=workout_user
      - POSTGRES_PASSWORD=your_secure_password
    restart: always
    
  web:
    build: .
    depends_on:
      - db
    environment:
      - DB_NAME=workout_db
      - DB_USER=workout_user
      - DB_PASSWORD=your_secure_password
      - DB_HOST=db
      - DB_PORT=5432
      - DJANGO_SETTINGS_MODULE=workout_backend.settings
      - DJANGO_SECRET_KEY=your_secret_key
    restart: always

volumes:
  postgres_data:
```

## Migrating from SQLite to PostgreSQL

If you've started with SQLite and want to migrate to PostgreSQL:

1. Create a database dump:
```bash
python manage.py dumpdata > db_dump.json
```

2. Update your database settings to PostgreSQL

3. Run migrations on the new database:
```bash
python manage.py migrate
```

4. Load the data into PostgreSQL:
```bash
python manage.py loaddata db_dump.json
```

## Troubleshooting

### Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check host/port settings
- Ensure your firewall allows connections to PostgreSQL port (default: 5432)

### Permission Issues
- Verify the user has appropriate privileges on the database
- Check the PostgreSQL authentication configuration in `pg_hba.conf`

### Migration Errors
- Make sure the PostgreSQL extensions required by your application are installed
- Check for database incompatibilities if migrating from another database system