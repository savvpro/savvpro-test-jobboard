# User Guide — JobBoard Pro

A step-by-step guide covering all 6 features of the JobBoard Pro platform.

---

## Getting Started

Make sure both the backend and frontend are running:

```bash
# Terminal 1 — Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

- **Backend:** http://localhost:8000 (API docs at http://localhost:8000/docs)
- **Frontend:** http://localhost:3000

---

## Feature 1 — Post a Job Listing

### Via Frontend
1. Click the **"+ Post Job"** button in the navigation bar.
2. Fill out the form:
   - **Title:** e.g. "Senior Software Engineer"
   - **Department:** e.g. "Engineering"
   - **Description:** Job responsibilities and requirements
   - **Location:** Remote / Hybrid / Onsite
   - **Salary Range:** Min and Max (min must be less than max)
   - **Required Skills:** Comma-separated list (e.g. "Python, FastAPI, React")
   - **Max Applicants:** Optional limit
   - **Deadline:** Application deadline date
3. Click **"Create Job Listing"**. You'll be redirected to the job detail page.

### Via API (curl)
```bash
curl -X POST http://localhost:8000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Full Stack Developer",
    "department": "Engineering",
    "description": "Build and maintain web applications.",
    "location": "remote",
    "salary_min": 90000,
    "salary_max": 140000,
    "required_skills": ["Python", "React", "PostgreSQL"],
    "max_applicants": 50,
    "deadline": "2026-06-30"
  }'
```

---

## Feature 2 — Browse & Search Jobs

### Via Frontend
1. Visit the **home page** (http://localhost:3000).
2. Use the **filter bar** at the top to narrow results:
   - **Department:** Type a department name
   - **Location:** Select from dropdown (Remote / Hybrid / Onsite)
   - **Skill:** Type a skill to match
   - **Include closed:** Toggle to show expired/closed listings
3. Use **pagination** buttons at the bottom to navigate pages.

### Via API (curl)
```bash
# All open jobs, page 1 (10 per page)
curl "http://localhost:8000/api/jobs"

# Filter by department and location, page 2
curl "http://localhost:8000/api/jobs?department=Engineering&location=remote&page=2&per_page=5"

# Search by skill
curl "http://localhost:8000/api/jobs?skill=Python"

# Include closed/expired listings
curl "http://localhost:8000/api/jobs?include_closed=true"
```

---

## Feature 3 — Apply to a Job

### Via Frontend
1. Click on any **job card** to open its detail page.
2. Click the **"Apply Now"** button.
3. Fill out the application form:
   - **Full Name:** Your name
   - **Email:** A valid email address
   - **Years of Experience:** 0 or more
   - **CV Summary:** Up to 1000 characters
   - **LinkedIn URL:** Optional (must start with `https://linkedin.com/` or `https://www.linkedin.com/`)
4. Click **"Submit Application"**.

**Business rules enforced:**
- Cannot apply to a closed or expired job
- Cannot exceed max applicants cap
- Cannot submit duplicate applications (same email + same job)

### Via API (curl)
```bash
curl -X POST http://localhost:8000/api/jobs/1/applications \
  -H "Content-Type: application/json" \
  -d '{
    "applicant_name": "Jane Doe",
    "email": "jane@example.com",
    "years_experience": 5,
    "cv_summary": "Full-stack developer with 5 years of experience in Python and React.",
    "linkedin_url": "https://linkedin.com/in/janedoe"
  }'
```

---

## Feature 4 — Application Status Workflow

### Valid Transitions
```
pending → shortlisted → offered
   ↓           ↓           ↓
rejected    rejected    rejected
```

### Via Frontend
1. Navigate to a job's detail page and click **"View Applications"**.
2. Each application row shows the current status and an **"Update"** button (if transitions are available).
3. Click **"Update"**, select the new status, enter a note, and click **"Confirm"**.

### Via API (curl)
```bash
# Shortlist an application
curl -X PATCH http://localhost:8000/api/applications/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "shortlisted", "note": "Strong technical skills, moving forward."}'

# Extend offer
curl -X PATCH http://localhost:8000/api/applications/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "offered", "note": "Extending formal offer."}'

# Reject
curl -X PATCH http://localhost:8000/api/applications/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "rejected", "note": "Position filled."}'

# View status history
curl http://localhost:8000/api/applications/1/history
```

---

## Feature 5 — Analytics Dashboard

### Via Frontend
1. Click **"Dashboard"** in the navigation bar.
2. View live metrics:
   - Total / Open / Closed jobs
   - Total applications
   - Average applications per job
   - Top department
3. Visual progress bars show job status distribution.

### Via API (curl)
```bash
curl http://localhost:8000/api/stats
```

Response:
```json
{
  "total_jobs": 5,
  "open_jobs": 3,
  "closed_jobs": 2,
  "total_applications": 24,
  "avg_applications_per_job": 4.8,
  "top_department": "Engineering"
}
```

---

## Feature 6 — Close a Job Listing

### Via Frontend
1. Open a job's detail page.
2. Click the red **"Close Listing"** button.
3. Confirm the action. All pending applications will be **auto-rejected**.

### Via API (curl)
```bash
curl -X PATCH http://localhost:8000/api/jobs/1/close
```

**What happens:**
- Job status changes to "closed"
- All `pending` applications are auto-rejected with note: "Auto-rejected: job listing was closed by hiring manager."
- `shortlisted` and `offered` applications are left unchanged
- New applications are rejected with an error
