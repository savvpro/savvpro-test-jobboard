# Architecture — JobBoard Pro

## Data Model

### jobs table
- id (INTEGER PRIMARY KEY AUTOINCREMENT)
- title (TEXT NOT NULL)
- department (TEXT NOT NULL)
- description (TEXT NOT NULL)
- location (TEXT NOT NULL) -- 'remote' | 'hybrid' | 'onsite'
- salary_min (INTEGER NOT NULL)
- salary_max (INTEGER NOT NULL)
- required_skills (TEXT NOT NULL) -- stored as JSON array
- max_applicants (INTEGER NULLABLE)
- deadline (TEXT NOT NULL) -- ISO date string
- status (TEXT NOT NULL DEFAULT 'open') -- 'open' | 'closed'
- created_at (TEXT NOT NULL)

### applications table
- id (INTEGER PRIMARY KEY AUTOINCREMENT)
- job_id (INTEGER NOT NULL, FK -> jobs.id)
- applicant_name (TEXT NOT NULL)
- email (TEXT NOT NULL)
- years_experience (INTEGER NOT NULL)
- cv_summary (TEXT NOT NULL)
- linkedin_url (TEXT NULLABLE)
- current_status (TEXT NOT NULL DEFAULT 'pending')
- created_at (TEXT NOT NULL)

### status_history table
- id (INTEGER PRIMARY KEY AUTOINCREMENT)
- application_id (INTEGER NOT NULL, FK -> applications.id)
- from_status (TEXT NULLABLE)
- to_status (TEXT NOT NULL)
- note (TEXT NOT NULL)
- changed_at (TEXT NOT NULL)

## API Design

### Jobs
- POST   /api/jobs              — create job listing
- GET    /api/jobs              — list/search/paginate jobs
- GET    /api/jobs/{id}         — get single job
- PATCH  /api/jobs/{id}/close   — close a job listing
- GET    /api/stats             — analytics

### Applications
- POST   /api/jobs/{id}/apply                — submit application
- GET    /api/jobs/{id}/applications         — list applications (filter by status)
- PATCH  /api/applications/{id}/status       — update application status

## Ambiguity Decisions

### 1. Duplicate Applications
Same email + same job = blocked with 409 Conflict. This is permanent even if the prior application was rejected, because re-application gaming undermines a fair process. Documented in error response.

### 2. Pending Applications on Job Close
When a job is manually closed, all pending applications are automatically set to 'rejected' with a system note: "Job listing closed by hiring manager." Rationale: leaving them as pending creates confusion for applicants.

### 3. max_applicants Cap Behaviour
When max_applicants is reached, the listing remains 'open' (visible, searchable) but rejects new applications with a 409 error. The listing only closes when a manager explicitly calls the close endpoint. Rationale: manager should retain control of listing visibility.

## Status Workflow

Valid transitions:
- pending → shortlisted (with required note)
- pending → rejected (with required note)
- shortlisted → offered (with required note)
- shortlisted → rejected (with required note)
- offered → rejected (with required note)
- Any backwards transition returns 422 Unprocessable Entity

All status changes are logged in status_history table.
