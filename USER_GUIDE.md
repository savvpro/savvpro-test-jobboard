# User Guide — JobBoard Pro

This guide walks through all features of JobBoard Pro from both the applicant and hiring manager perspectives.

---

## Setup

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
Backend at: **http://localhost:8000**

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend at: **http://localhost:3000**

---

## Feature 1 — Posting a Job Listing (Hiring Manager)

**Via the UI:**  
Hiring managers can navigate to the landing page and click the "Post a Job" button. A clean, Apple-inspired form allows input for title, department, location, description, salary range, and required skills.

**Via the API:**
```bash
curl -X POST http://localhost:8000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Backend Engineer",
    "department": "Engineering",
    "description": "Join our platform team to build scalable APIs.",
    "location": "remote",
    "salary_min": 90000,
    "salary_max": 140000,
    "required_skills": ["Python", "FastAPI", "PostgreSQL"],
    "max_applicants": 50,
    "deadline": "2025-12-31"
  }'
```

---

## Feature 2 — Browsing & Searching Jobs (Applicant)

**Via the UI:**  
The home page features a sticky "FilterBar" allowing applicants to filter by department, location (remote/hybrid/onsite), and a text search for specific skills. Jobs are displayed in premium cards with subtle hover animations.

**Via the API:**
```bash
# Filter by skill
curl "http://localhost:8000/api/jobs?skill=Python"

# Combine filters with pagination
curl "http://localhost:8000/api/jobs?department=Engineering&page=1&per_page=5"
```

---

## Feature 3 — Submitting an Application (Applicant)

**Via the UI:**  
Clicking a job card opens the detail view. At the bottom, an inline "Apply Now" form collects name, email, experience, CV summary, and LinkedIn URL.

**Via the API:**
```bash
curl -X POST http://localhost:8000/api/jobs/1/apply \
  -H "Content-Type: application/json" \
  -d '{
    "applicant_name": "Jane Smith",
    "email": "jane@example.com",
    "years_experience": 5,
    "cv_summary": "Full-stack engineer with 5 years specialising in Python backend systems.",
    "linkedin_url": "https://linkedin.com/in/janesmith"
  }'
```

---

## Feature 4 — Managing the Application Pipeline (Hiring Manager)

**Via the UI:**  
Hiring managers click "View Applications" on any job to see the pipeline. Applications are grouped by status (Pending, Shortlisted, Offered, Rejected). Managers can update status via an inline dropdown that requires a mandatory note.

**Update Status Example:**
```bash
curl -X PATCH http://localhost:8000/api/applications/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "shortlisted", "note": "Strong technical background, great portfolio."}'
```

---

## Feature 5 — Hiring Analytics Dashboard (Hiring Manager)

**Via the UI:**  
The `/dashboard` page provides a real-time overview of recruitment health, including active job counts, application volumes, and department-wise distribution.

**Via the API:**
```bash
curl http://localhost:8000/api/stats
```

---

## Feature 6 — Closing a Job Listing (Hiring Manager)

**Via the UI:**  
Managed listings have a "Close Job" button. Closing a job immediately prevents new applications and automatically rejets all candidates currently in "Pending" status.

**Via the API:**
```bash
curl -X PATCH http://localhost:8000/api/jobs/1/close
```

---

## Validation Reference

| Field | Rule | Error |
|-------|------|-------|
| salary_min | Must be < salary_max | 422 |
| email | Valid email format | 422 |
| linkedin_url | Must start with https://linkedin.com/ | 422 |
| years_experience | Must be ≥ 0 | 422 |
| duplicate application | Same email + job | 409 |
