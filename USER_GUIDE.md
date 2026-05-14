# User Guide — JobBoard Pro

A step-by-step guide for using every feature of JobBoard Pro.

---

## Starting the App

**Backend:**
```bash
source .venv/bin/activate
uvicorn backend.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend && npm run dev
```

Open http://localhost:3000 in your browser.

---

## Feature 1 — Browse Jobs

The homepage (`/`) shows all open, non-expired job listings.

**Search & Filter:**
- Type in the **Search** box to match job titles, descriptions, or departments
- Use the **Department** dropdown to filter by department
- Use the **Location** dropdown to filter by `remote`, `hybrid`, or `onsite`
- Type a skill in the **Skill** box to match jobs requiring that skill
- Click **✕ Clear** to reset all filters

**curl equivalent:**
```bash
curl "http://localhost:8000/api/jobs?department=Engineering&location=remote&skill=Python&page=1&per_page=10"
```

---

## Feature 2 — Post a Job

**Via curl:**
```bash
curl -X POST http://localhost:8000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Backend Engineer",
    "department": "Engineering",
    "description": "Build scalable APIs for our platform.",
    "location": "remote",
    "salary_min": 90000,
    "salary_max": 140000,
    "required_skills": ["Python", "FastAPI", "PostgreSQL"],
    "max_applicants": 50,
    "deadline": "2026-06-30"
  }'
```

**Response (201):**
```json
{
  "id": 1,
  "title": "Senior Backend Engineer",
  "is_closed": false,
  ...
}
```

---

## Feature 3 — Apply to a Job

Navigate to a job listing and click it, then fill in the **Apply for this role** form on the right sidebar.

**Validations enforced:**
- Email must be valid format
- LinkedIn URL must start with `https://linkedin.com/` or `https://www.linkedin.com/`
- CV Summary has a 1000-character counter
- Years of experience must be ≥ 0
- Cannot apply after the deadline or to a closed listing
- Duplicate applications (same email + job) return a clear error

**curl equivalent:**
```bash
curl -X POST http://localhost:8000/api/jobs/1/apply \
  -H "Content-Type: application/json" \
  -d '{
    "applicant_name": "Jane Doe",
    "email": "jane@example.com",
    "years_experience": 5,
    "cv_summary": "Experienced backend engineer with 5 years in Python and distributed systems.",
    "linkedin_url": "https://linkedin.com/in/janedoe"
  }'
```

---

## Feature 4 — Application Status Workflow

Go to a job detail page and click **📂 View Applications Pipeline**.

- **Filter tabs** at the top: All / Pending / Shortlisted / Offered / Rejected
- Click any application row to expand it
- View the **Status History** timeline showing every transition with notes and timestamps
- Use the **Update Status** form to move an application forward:
  1. Select the new status from the dropdown (only valid transitions are shown)
  2. Enter a mandatory note
  3. Click **Update**

**Valid transitions:**
```
pending → shortlisted or rejected
shortlisted → offered or rejected
offered → rejected
```

**curl equivalent:**
```bash
curl -X PATCH http://localhost:8000/api/applications/1/status \
  -H "Content-Type: application/json" \
  -d '{"new_status": "shortlisted", "note": "Great portfolio and strong Python skills"}'
```

**Filter by status:**
```bash
curl "http://localhost:8000/api/jobs/1/applications?status=shortlisted"
```

---

## Feature 5 — Analytics Dashboard

Navigate to `/dashboard` or click **Dashboard** in the nav.

Displays live stats:
- Total jobs, open jobs, closed/expired jobs
- Total applications
- Average applications per job (rounded to 2 decimal places)
- Top department (by number of open roles)

**curl equivalent:**
```bash
curl http://localhost:8000/api/stats
```

**Response:**
```json
{
  "total_jobs": 12,
  "open_jobs": 8,
  "closed_jobs": 4,
  "total_applications": 47,
  "avg_applications_per_job": 3.92,
  "top_department": "Engineering"
}
```

---

## Feature 6 — Close a Job Listing

On a job detail page, click the **Close Job** button in the manager panel at the bottom.

**Behaviour:**
- The listing is marked `is_closed = true`
- All `pending` applications are automatically rejected with note `"Job closed by hiring manager"`
- Applications in `shortlisted` or `offered` state are left untouched
- New applications to the closed listing return a `400` error

**curl equivalent:**
```bash
curl -X POST http://localhost:8000/api/jobs/1/close
```

---

## Error Codes Reference

| Code | Meaning |
|------|---------|
| 201 | Resource created successfully |
| 400 | Business rule violation (deadline passed, job closed, cap reached) |
| 404 | Job or application not found |
| 409 | Duplicate application (same email + job) |
| 422 | Validation error (salary range, missing fields, etc.) |
