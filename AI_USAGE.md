# AI Usage — JobBoard Pro

## Tool Used

**Antigravity (Google DeepMind)** — An agentic AI coding assistant integrated into the development environment.

---

## Verbatim Prompts Used

### Prompt 1 — Database and Models

> "Create a FastAPI app in `/backend`. Set up SQLite with SQLAlchemy. Create 3 models: `Job` (fields: id, title, department, description, location enum [remote/hybrid/onsite], salary_min, salary_max, required_skills as JSON string, max_applicants nullable int, deadline date, is_closed bool default false, created_at datetime), `Application` (id, job_id FK, applicant_name, email, years_experience, cv_summary, linkedin_url nullable, current_status enum [pending/shortlisted/offered/rejected] default pending, created_at), `StatusHistory` (id, application_id FK, from_status nullable, to_status, note, changed_at). Add a unique constraint on (job_id, email) in Application."

---

### Prompt 2 — Jobs Router

> "In `/backend/routers/jobs.py`, create a jobs router. Add `POST /api/jobs` that validates salary_min < salary_max (raise 422 with custom message), required_skills must be non-empty list. Add `GET /api/jobs` with optional query filters: department, location, skill (match if skill appears anywhere in required_skills JSON string), plus pagination via page and per_page. Response must include total_count, page, per_page, results. Past-deadline or closed listings excluded by default; visible with include_closed=true. Add `GET /api/jobs/{id}` and `POST /api/jobs/{id}/close`."

---

### Prompt 3 — Applications Router and Status Workflow

> "In `/backend/routers/applications.py`, add `POST /api/jobs/{id}/apply`. Validate: cannot apply after deadline, cannot apply to closed listing, cannot apply if max_applicants reached, block duplicates with 409. Insert an initial status_history row with from_status=null, to_status=pending, note='Application submitted'. Then add `PATCH /api/applications/{id}/status`. It accepts `{new_status: str, note: str}`. Validate: note must be non-empty. Check against VALID_TRANSITIONS dict — if invalid, return 400 with message 'Cannot transition from X to Y'. If valid: update current_status on the application, insert a status_history row. Return the updated application with its full history."

---

### Prompt 4 — Stats and Close Job

> "Add `GET /api/stats`. Compute from DB: total_jobs, open_jobs (is_closed=false and deadline >= today), closed_jobs, total_applications, avg_applications_per_job (round to 2 decimal), top_department (department with most open jobs). Return as JSON. No hardcoded values. Also in `POST /api/jobs/{id}/close`: set is_closed=true on the job. Find all applications where job_id=this and current_status='pending'. For each: set current_status='rejected', insert a status_history row with note='Job closed by hiring manager', from_status='pending', to_status='rejected'. Return the updated job."

---

### Prompt 5 — Pytest Suite

> "Write pytest tests in `/tests/test_main.py` using TestClient from fastapi.testclient. Use an in-memory SQLite DB (override the dependency). Write these tests: 1) create a job returns 201 with correct fields, 2) salary_min >= salary_max returns 422, 3) pagination returns correct page/per_page/total_count, 4) status workflow: apply → shortlist → reject, verify status_history has 3 entries, 5) apply after deadline returns 400, 6) duplicate application returns 409, 7) invalid status transition returns 400, 8) closing a job auto-rejects pending applications, 9) max_applicants cap blocks new application, 10) stats endpoint returns live computed values."

---

### Prompt 6 — Next.js Frontend

> "Create a Next.js app at `/frontend`. Build 4 pages: `/` (job listings with search bar and 3 filter dropdowns for department, location, skill — all state in useState, fetch on filter change with useEffect), `/jobs/[id]` (job detail with full info, apply form with client-side validation: linkedin URL check before submit, cv_summary char counter max 1000, years_experience min=0, plus close job button for managers), `/jobs/[id]/applications` (pipeline with status filter tabs, inline ApplicationRow with expandable history timeline and status update form), `/dashboard` (stats grid consuming GET /api/stats). Use a dark-mode design with glassmorphism, smooth hover animations, skill tags, status badges color-coded by status."

---

### Prompt 7 — Reusable Components

> "Create 4 reusable components: `JobCard.tsx` (displays title, department, location badge, salary range, deadline, skills chips, hover animation), `StatusBadge.tsx` (color-coded: pending=yellow, shortlisted=blue, offered=green, rejected=red — with a colored dot), `PaginationControls.tsx` (prev/next buttons, numbered pages with ellipsis for long ranges, current page highlighted, shows X–Y of Z), `ApplicationRow.tsx` (expandable row: avatar with initials, name, email, experience badge, current status badge, CV summary, LinkedIn link, status history timeline, inline status update form with select + note + submit)."

---

## AI Errors Encountered and Corrections

### Error 1: `datetime.now()` Without Timezone

**What the AI generated:**
```python
created_at = Column(DateTime, default=datetime.now)
```

**Problem:** `datetime.now()` returns a naive datetime (no timezone info). When comparing with dates that include timezone info, this causes implicit comparison errors and potential bugs in production.

**Correction applied:**
```python
from datetime import datetime, timezone
created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
```

Using `timezone.utc` ensures all timestamps are timezone-aware and consistent across the application.

---

### Error 2: Missing Default Filter for `include_closed`

**What the AI generated:**
```python
@router.get("")
def list_jobs(include_closed: bool = Query(True), ...):
```

**Problem:** The AI defaulted `include_closed` to `True`, meaning closed and expired jobs were shown by default — the opposite of the spec which says "Return all open, non-expired listings by default."

**Correction applied:**
```python
include_closed: bool = Query(False)
```
Then added the filter:
```python
if not include_closed:
    query = query.filter(Job.is_closed == False, Job.deadline >= today)
```

This was caught during manual testing when all jobs disappeared after being closed — because they were being included by default.

---

### Error 3: Status History Not Included on Initial Application

**What the AI generated:**  
The initial `POST /apply` endpoint did not create a `StatusHistory` entry for the initial `pending` state.

**Problem:** The applications pipeline page relied on `status_history` to display the audit trail. With no initial entry, new applications appeared to have no history at all — confusing for the UI.

**Correction applied:** Added an explicit `StatusHistory` insert after creating the application:
```python
history = StatusHistory(
    application_id=app.id,
    from_status=None,
    to_status=StatusEnum.pending,
    note="Application submitted",
    changed_at=datetime.now(timezone.utc),
)
db.add(history)
```
