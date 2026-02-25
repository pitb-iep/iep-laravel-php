# IEP API - Laravel Version

A Laravel-based REST API for managing Individualized Education Programs (IEPs) with MySQL database.

## Project Structure

This is a complete migration from the Node.js/Express API to Laravel 11 with the following components:

### Database Tables
- **users** - User accounts (Admin, School Head, Teacher, Parent roles)
- **students** - Student records
- **goals** - Curriculum goals/objectives
- **domains** - Educational domains
- **sub_skills** - Sub-skills within domains
- **ieps** - Individualized Education Programs
- **logs** - Daily progress and activity logs
- **incidents** - Behavior incident reports
- **assessments** - Student assessments
- **behavior_protocols** - Behavior intervention protocols
- **mastery_verifications** - Goal mastery verification records
- **daily_summaries** - Daily progress summaries
- **student_user** - Pivot table for student-parent relationships

### Models
All Eloquent models are located in `app/Models/` with proper relationships defined:
- `User` - Implements JWT authentication
- `Student`
- `Goal`
- `SubSkill`
- `Domain`
- `IEP`
- `Log`
- `Incident`
- `Assessment`
- `BehaviorProtocol`
- `MasteryVerification`
- `DailySummary`

### Controllers
RESTful API controllers in `app/Http/Controllers/`:
- `AuthController` - User registration, login, password change
- `StudentController` - CRUD operations for students
- `IepController` - IEP management
- `LogController` - Activity logging
- `GoalController` - Curriculum goals
- (Additional controllers can be created for other models)

### Routes
All API routes are defined in `routes/api.php`:
- Public routes for registration and login
- Protected routes with JWT middleware for authenticated operations
- RESTful endpoints following standard conventions

## Setup Instructions

### 1. Install Dependencies
```bash
composer install
```

### 2. Environment Configuration
```bash
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

Update `.env` with your MySQL database credentials:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=iep_app
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Create Database
```bash
mysql -u root -p
CREATE DATABASE iep_app;
EXIT;
```

### 4. Run Migrations
```bash
php artisan migrate
```

### 5. Start Development Server
```bash
php artisan serve
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/updatepassword` - Update password (protected)
- `POST /api/auth/logout` - Logout user (protected)

### Students
- `GET /api/students` - List all students (protected)
- `POST /api/students` - Create student (protected)
- `GET /api/students/{id}` - Get student details (protected)
- `PUT /api/students/{id}` - Update student (protected)
- `DELETE /api/students/{id}` - Delete student (protected)

### IEPs
- `GET /api/students/{studentId}/ieps` - List IEPs for student (protected)
- `POST /api/students/{studentId}/ieps` - Create IEP (protected)
- `GET /api/ieps/{id}` - Get IEP details (protected)
- `PUT /api/ieps/{id}` - Update IEP (protected)

### Logs
- `GET /api/students/{studentId}/logs` - List logs for student (protected)
- `POST /api/students/{studentId}/logs` - Create log entry (protected)
- `GET /api/logs/{id}` - Get log details (protected)

### Goals
- `GET /api/goals` - List all goals (protected)
- `POST /api/goals` - Create goal (protected)
- `GET /api/goals/{id}` - Get goal details (protected)
- `PUT /api/goals/{id}` - Update goal (protected)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After login, include the token in the Authorization header:

```
Authorization: Bearer {token}
```

## Key Features Migrated from Node.js

✅ User authentication with JWT
✅ Role-based access control (Admin, School Head, Teacher, Parent)
✅ Student management with parent relationships
✅ IEP creation and management with automatic archiving of previous versions
✅ Activity logging with session types (Teaching, Baseline, Probe, etc.)
✅ Parent account creation with temporary passwords
✅ Comprehensive data validation
✅ Error handling with consistent JSON responses
✅ Relationship management using Eloquent ORM

## Next Steps

1. **Create seeder** - Add database seeders for initial data in `database/seeders/`
2. **Add additional controllers** - Create controllers for remaining models (Incident, Assessment, etc.)
3. **Implement caching** - Add Redis caching for frequently accessed data
4. **Add logging** - Configure application logging for debugging
5. **API documentation** - Generate API docs using tools like Scribe or Swagger
6. **Write tests** - Create feature and unit tests in `tests/`
7. **Deploy** - Setup deployment configuration (Docker, CI/CD, etc.)

## File Structure

```
iep-api-laravel/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   └── Models/
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   └── api.php
├── .env
├── config/
│   └── auth.php
└── composer.json
```

## Database Schema Highlights

- All timestamps use `created_at` and `updated_at` for auditing
- Foreign keys use cascading deletes where appropriate
- Indexes on frequently queried columns for performance
- JSON columns for flexible data storage (therapies, accommodations, team members)
- Unique constraints on email and composite keys where needed

## Technologies Used

- **Framework**: Laravel 11
- **Database**: MySQL 8.0+
- **Authentication**: JWT (JSON Web Tokens)
- **ORM**: Eloquent

## Support

For issues or questions, refer to the Laravel documentation:
- https://laravel.com/docs
- https://github.com/PHPOpenSourceSaver/jwt-auth
