# JobBoard Pro - FastAPI Backend

A complete REST API for a hiring platform with job listings, applications, and application status workflow.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment (Optional)

Create a `.env` file in the backend directory:

```env
DATABASE_URL=sqlite:///./app.db
```

### 3. Initialize Database

The database tables will be created automatically when the app starts.

### 4. Run the Server

```bash
python run.py
```

Or manually with uvicorn:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

---

## API Endpoints

### 1. Job Management

#### Create a Job Listing
```
POST /api/jobs
```
**Request Body:**
```json
{
  "title": "Senior Backend Engineer",
  "department": "Engineering",
  "description": "Looking for an experienced backend engineer with 5+ years of experience.",
  "location": "remote",
  "salary_min": 100000,
  "salary_max": 150000,
  "required_skills": ["Python", "FastAPI", "SQL"],
  "max_applicants": 100,
  "deadline": "2026-06-30"
}
```

#### Browse & Search Jobs
```
GET /api/jobs?page=1&per_page=10&department=Engineering&location=remote&skill=Python&include_closed=false
```
**Query Parameters:**
- `page` (default: 1) - Page number
- `per_page` (default: 10) - Results per page
- `department` (optional) - Filter by department
- `location` (optional) - Filter by location (remote/hybrid/onsite)
- `skill` (optional) - Filter by required skill
- `include_closed` (default: false) - Include closed/expired listings

#### Get Job Details
```
GET /api/jobs/{job_id}
```

---

### 2. Applications

#### Apply to a Job
```
POST /api/jobs/{job_id}/applications
```
**Request Body:**
```json
{
  "applicant_name": "John Doe",
  "email": "john@example.com",
  "years_experience": 5,
  "cv_summary": "Experienced backend engineer with expertise in Python and FastAPI.",
  "linkedin_url": "https://linkedin.com/in/johndoe"
}
```

**Business Rules:**
- Cannot apply after job deadline
- Cannot apply to closed jobs
- Cannot exceed max_applicants limit
- Each email can only apply once per job
- All new applications start with "pending" status

#### Get Job Applications
```
GET /api/jobs/{job_id}/applications?status=pending
```
**Query Parameters:**
- `status` (optional) - Filter by status (pending/shortlisted/offered/rejected)

---

### 3. Application Status Workflow

#### Update Application Status
```
PUT /api/applications/{application_id}/status
```
**Request Body:**
```json
{
  "status": "shortlisted",
  "note": "Passed initial screening"
}
```

**Valid Transitions:**
- `pending` → `shortlisted` or `rejected`
- `shortlisted` → `offered` or `rejected`
- `offered` → `rejected`
- `rejected` → (no transitions allowed)

#### Get Application Status History
```
GET /api/applications/{application_id}/status-history
```

**Response:**
```json
[
  {
    "id": 1,
    "application_id": 123,
    "previous_status": null,
    "new_status": "pending",
    "note": "Application submitted",
    "timestamp": "2026-05-14T10:30:00"
  },
  {
    "id": 2,
    "application_id": 123,
    "previous_status": "pending",
    "new_status": "shortlisted",
    "note": "Passed initial screening",
    "timestamp": "2026-05-15T14:22:00"
  }
]
```

---

### 4. Analytics

#### Get Platform Statistics
```
GET /api/stats
```

**Response:**
```json
{
  "total_jobs": 25,
  "open_jobs": 18,
  "closed_jobs": 7,
  "total_applications": 342,
  "avg_applications_per_job": 13.68,
  "top_department": "Engineering"
}
```

---

### 5. Health Check

#### Health Check
```
GET /health
```

---

## Database Schema

### Job Table
- `id` (PK)
- `title` - Job title
- `department` - Department name
- `description` - Full job description
- `location` - Enum: remote/hybrid/onsite
- `salary_min` - Minimum salary (must be < salary_max)
- `salary_max` - Maximum salary
- `required_skills` - JSON array of required skills
- `max_applicants` - Optional cap on number of applicants
- `deadline` - Application deadline
- `is_closed` - Whether job is manually closed
- `created_at` - Timestamp
- `updated_at` - Timestamp
- `is_deleted` - Soft delete flag

### Application Table
- `id` (PK)
- `job_id` (FK) - Reference to Job
- `applicant_name` - Applicant's full name
- `email` - Applicant's email (unique constraint with job_id)
- `years_experience` - Years of experience (≥ 0)
- `cv_summary` - CV summary (max 1000 chars)
- `linkedin_url` - LinkedIn profile URL (optional)
- `status` - Current status (pending/shortlisted/offered/rejected)
- `created_at` - Timestamp
- `updated_at` - Timestamp
- `is_deleted` - Soft delete flag

### ApplicationStatusHistory Table
- `id` (PK)
- `application_id` (FK) - Reference to Application
- `previous_status` - Previous status (can be null for initial)
- `new_status` - New status
- `note` - Note/reason for status change
- `timestamp` - When change occurred
- `created_at` - Timestamp
- `updated_at` - Timestamp
- `is_deleted` - Soft delete flag

---

## Duplicate Application Handling

**Policy:** Duplicate applications (same email + same job) are rejected with a 409 Conflict error.

This prevents the same applicant from submitting multiple applications to the same job and is enforced at the database level with a unique constraint.

---

## Closed Job Handling

**Policy:** When a job is closed manually or the deadline passes:
- No new applications are accepted
- Existing pending applications remain in the system
- The job can still be viewed via API with the `include_closed=true` flag

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK` - Successful GET request
- `201 Created` - Successful resource creation
- `400 Bad Request` - Invalid input or business rule violation
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate application or constraint violation
- `500 Internal Server Error` - Server error

Error responses include a `detail` field explaining the issue.

---

## Features Implemented

✅ **Feature 1**: Post Job Listings  
✅ **Feature 2**: Browse & Search Jobs with Pagination  
✅ **Feature 3**: Apply to Jobs  
✅ **Feature 4**: Application Status Workflow with History  
✅ **Feature 5**: Platform Analytics

---

## Tech Stack

- **Framework**: FastAPI
- **ORM**: SQLAlchemy
- **Database**: SQLite (can be changed to PostgreSQL, MySQL, etc.)
- **Validation**: Pydantic v2
- **Server**: Uvicorn

---

## Notes

- All timestamps use UTC
- The database uses SQLite by default (suitable for development)
- For production, consider using PostgreSQL
- Soft delete is implemented but not enforced in most queries
