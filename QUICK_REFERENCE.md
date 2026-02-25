# Laravel IEP API - Quick Reference

## Quick Start

```bash
cd /Users/sheraz/work/iep/iep-api-laravel

# 1. Install dependencies
composer install

# 2. Configure database (.env)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=iep_app
DB_USERNAME=root
DB_PASSWORD=

# 3. Generate keys
php artisan key:generate
php artisan jwt:secret

# 4. Create database
mysql -u root -p
CREATE DATABASE iep_app;

# 5. Run migrations
php artisan migrate

# 6. Start server
php artisan serve
```

API available at: `http://localhost:8000/api`

---

## API Testing

### 1. Register User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Teacher",
    "email": "teacher@example.com",
    "password": "password123",
    "role": "Teacher"
  }'
```

Response:
```json
{
  "success": true,
  "data": {...user data...},
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "password": "password123"
  }'
```

### 3. Create Student (with token)
```bash
curl -X POST http://localhost:8000/api/students \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Johnny Doe",
    "dob": "2015-05-12",
    "diagnosis": "Autism Spectrum Disorder",
    "program_stream": "ECE",
    "parentEmail": "parent@example.com",
    "parentName": "Jane Doe"
  }'
```

### 4. Get All Students
```bash
curl -X GET http://localhost:8000/api/students \
  -H "Authorization: Bearer {token}"
```

### 5. Create IEP
```bash
curl -X POST http://localhost:8000/api/students/{studentId}/ieps \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Draft",
    "review_period": "Quarterly",
    "strengths": "Good verbal skills",
    "concerns": "Difficulty with social interactions"
  }'
```

### 6. Create Activity Log
```bash
curl -X POST http://localhost:8000/api/students/{studentId}/logs \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "goal_id": 1,
    "performance_status": "Achieved",
    "rubric_level": 4,
    "trials_correct": 9,
    "trials_total": 10,
    "session_type": "Teaching",
    "activity": "ABA discrete trial training"
  }'
```

---

## Database Schema Quick View

### Users Table
```sql
id, name, full_name, email, password, role, force_password_change, 
remember_token, created_at, updated_at
```

### Students Table
```sql
id, teacher_id, name, dob, diagnosis, current_level, program_stream, 
active_therapies (JSON), is_active, created_at, updated_at
```

### Goals Table
```sql
id, code, sub_skill_id, title, description, tier, age_group, 
short_term_objectives (JSON), skill_type, prompt_level, mastery_criteria, 
measurement_type, data_collection_interval, quick_start (JSON), 
created_at, updated_at
```

### IEPs Table
```sql
id, student_id, created_by, status, start_date, end_date, review_period, 
next_review_date, strengths, concerns, impact, academics, functional, 
team_members (JSON), instructional_accommodations (JSON), 
environmental_accommodations (JSON), assessment_accommodations (JSON), 
post_secondary_goals, vocational_goals, esy_required, esy_justification, 
teaching_approach, created_at, updated_at
```

### Logs Table
```sql
id, student_id, recorded_by, goal_id, iep_id, performance_status, 
rubric_level, activity, trials_correct, trials_total, is_independent, 
prompt_level, session_type, include_in_progress, notes, logged_at, 
created_at, updated_at
```

---

## Controller Methods

### AuthController
- `register()` - POST /api/auth/register
- `login()` - POST /api/auth/login
- `getMe()` - GET /api/auth/me
- `updatePassword()` - PUT /api/auth/updatepassword
- `logout()` - POST /api/auth/logout

### StudentController
- `index()` - GET /api/students
- `show($id)` - GET /api/students/{id}
- `store()` - POST /api/students
- `update($id)` - PUT /api/students/{id}
- `destroy($id)` - DELETE /api/students/{id}

### IepController
- `index($studentId)` - GET /api/students/{studentId}/ieps
- `show($id)` - GET /api/ieps/{id}
- `store($studentId)` - POST /api/students/{studentId}/ieps
- `update($id)` - PUT /api/ieps/{id}

### LogController
- `index($studentId)` - GET /api/students/{studentId}/logs
- `show($id)` - GET /api/logs/{id}
- `store($studentId)` - POST /api/students/{studentId}/logs

### GoalController
- `index()` - GET /api/goals (supports filters: tier, skill_type, sub_skill_id)
- `show($id)` - GET /api/goals/{id}
- `store()` - POST /api/goals
- `update($id)` - PUT /api/goals/{id}

---

## Key Relationships

```
User
  - hasMany Student (as teacher_id)
  - belongsToMany Student (as parent via student_user pivot)
  - hasMany Log (as recorded_by)
  - hasMany IEP (as created_by)
  - hasMany Incident (as recorded_by)

Student
  - belongsTo User (teacher)
  - belongsToMany User (parents)
  - hasMany Log
  - hasMany IEP
  - hasMany Incident
  - hasMany Assessment

Goal
  - belongsTo SubSkill
  - hasMany Log
  - hasMany Assessment
  - hasMany MasteryVerification

IEP
  - belongsTo Student
  - belongsTo User (createdBy)
  - hasMany Log
  - hasMany MasteryVerification

Log
  - belongsTo Student
  - belongsTo Goal
  - belongsTo User (recordedBy)
  - belongsTo IEP
```

---

## Common Queries

### Get student with all relationships
```php
$student = Student::with([
    'teacher:id,name,email',
    'parents:id,name,email',
    'logs.goal:id,title',
    'ieps',
])->find($id);
```

### Get student's recent logs
```php
$logs = Log::where('student_id', $studentId)
    ->with(['goal', 'recordedBy'])
    ->orderBy('logged_at', 'desc')
    ->limit(10)
    ->get();
```

### Get active IEP for student
```php
$iep = IEP::where('student_id', $studentId)
    ->where('status', 'Active')
    ->first();
```

### Get goals by tier
```php
$goals = Goal::where('tier', 'A')
    ->with('subSkill')
    ->get();
```

---

## Validation Rules

### User Registration
- name: required|string
- email: required|email|unique:users
- password: required|string|min:6

### Student Creation
- name: required|string
- dob: sometimes|date
- diagnosis: sometimes|string
- program_stream: sometimes|in:ECE,Junior,Senior,Autism Support,General Ed,Life Skills

### IEP Creation
- status: sometimes|in:Active,Draft,Archived
- start_date: sometimes|date
- end_date: sometimes|date
- review_period: sometimes|string

### Log Creation
- goal_id: required|exists:goals,id
- performance_status: sometimes|in:Achieved,Emerging,Not Yet
- rubric_level: sometimes|integer|min:1|max:5
- session_type: sometimes|in:Teaching,Baseline,Probe,Generalization,Maintenance
- trials_correct: sometimes|integer|min:0
- trials_total: sometimes|integer|min:0

---

## File Locations

**Controllers**: `app/Http/Controllers/`
**Models**: `app/Models/`
**Migrations**: `database/migrations/`
**Routes**: `routes/api.php`
**Configuration**: `config/auth.php`, `.env`

---

## Environment Variables

```env
APP_NAME="IEP API"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=iep_app
DB_USERNAME=root
DB_PASSWORD=

JWT_SECRET=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
JWT_TTL=43200
```

---

## Error Response Format

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

---

## Role-Based Features

### Teacher Role
- Can create students and assign to themselves
- Can view/modify their own students
- Can create IEPs, logs, and assessments

### Parent Role
- Can only view their assigned students
- Can view logs and IEPs
- Cannot create or modify data

### Admin Role
- Full access to all endpoints
- Can manage all users, students, and IEPs

### School Head Role
- Can view all students
- Can manage teachers
- Full reporting access

---

## Development Tips

1. **Run tests**: `php artisan test`
2. **Check migrations**: `php artisan migrate:status`
3. **Rollback migrations**: `php artisan migrate:rollback`
4. **Seed data**: `php artisan db:seed`
5. **Tinker shell**: `php artisan tinker`
6. **Clear cache**: `php artisan cache:clear`
7. **View routes**: `php artisan route:list --path=api`

---

## Common Commands

```bash
# Generate migration
php artisan make:migration create_table_name

# Generate model
php artisan make:model ModelName

# Generate controller
php artisan make:controller ControllerName

# Run migrations
php artisan migrate

# Rollback last batch
php artisan migrate:rollback

# Fresh migrations
php artisan migrate:fresh

# Seed database
php artisan db:seed

# Clear cache
php artisan cache:clear config:clear

# Export routes
php artisan route:list
```

---
