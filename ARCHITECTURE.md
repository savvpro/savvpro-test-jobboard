# Architecture — JobBoard Pro

## Overview

JobBoard Pro is a full-stack job listing and application management platform. It uses **FastAPI** (Python) for the backend API and **Next.js** (React) for the frontend. Data is persisted in **SQLite** via SQLAlchemy ORM.

---

## Data Model

### Entity-Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────────┐
│     Job      │       │   Application    │       │  ApplicationHistory  │
├──────────────┤       ├──────────────────┤       ├──────────────────────┤
│ id (PK)      │──1:N──│ id (PK)          │──1:N──│ id (PK)              │
│ title        │       │ job_id (FK)      │       │ application_id (FK)  │
│ department   │       │ applicant_name   │       │ old_status           │
│ description  │       │ email            │       │ new_status           │
│ location     │       │ years_experience │       │ note                 │
│ salary_min   │       │ cv_summary       │       │ changed_at           │
│ salary_max   │       │ linkedin_url     │       └──────────────────────┘
│ required_skills (JSON)│ status          │
│ max_applicants│      │ created_at       │
│ deadline     │       └──────────────────┘
│ status       │       UNIQUE(job_id, email)
│ created_at   │
└──────────────┘
```

### Jobs Table

| Column           | Type         | Constraints                          |
|------------------|--------------|--------------------------------------|
| id               | INTEGER      | Primary Key, Auto-increment          |
| title            | VARCHAR(200) | NOT NULL                             |
| department       | VARCHAR(100) | NOT NULL                             |
| description      | TEXT         | NOT NULL                             |
| location         | VARCHAR(10)  | NOT NULL, ENUM: remote/hybrid/onsite |
| salary_min       | INTEGER      | NOT NULL                             |
| salary_max       | INTEGER      | NOT NULL, must be > salary_min       |
| required_skills  | JSON (TEXT)  | NOT NULL, at least one skill         |
| max_applicants   | INTEGER      | NULLABLE                             |
| deadline         | DATE         | NOT NULL                             |
| status           | VARCHAR(10)  | NOT NULL, DEFAULT 'open'             |
| created_at       | DATETIME     | NOT NULL, auto-set                   |

### Applications Table

| Column           | Type         | Constraints                              |
|------------------|--------------|------------------------------------------|
| id               | INTEGER      | Primary Key, Auto-increment              |
| job_id           | INTEGER      | Foreign Key → jobs.id, NOT NULL          |
| applicant_name   | VARCHAR(200) | NOT NULL                                 |
| email            | VARCHAR(200) | NOT NULL, valid email format              |
| years_experience | INTEGER      | NOT NULL, >= 0                           |
| cv_summary       | TEXT         | NOT NULL, max 1000 characters            |
| linkedin_url     | VARCHAR(500) | NULLABLE, must start with linkedin URL   |
| status           | VARCHAR(20)  | NOT NULL, DEFAULT 'pending'              |
| created_at       | DATETIME     | NOT NULL, auto-set                       |

**Unique Constraint:** `(job_id, email)` — one application per email per job.

### Application History Table (Status Audit Log)

| Column         | Type     | Constraints                          |
|----------------|----------|--------------------------------------|
| id             | INTEGER  | Primary Key, Auto-increment          |
| application_id | INTEGER  | Foreign Key → applications.id        |
| old_status     | VARCHAR  | NULLABLE (null for initial creation)  |
| new_status     | VARCHAR  | NOT NULL                             |
| note           | TEXT     | NOT NULL                             |
| changed_at     | DATETIME | NOT NULL, auto-set                   |

---

## API Design

### Jobs

| Method | Endpoint                        | Description                              |
|--------|---------------------------------|------------------------------------------|
| POST   | `/api/jobs`                     | Create a new job listing                 |
| GET    | `/api/jobs`                     | Browse/search jobs with filters & paging |
| GET    | `/api/jobs/{id}`                | Get a single job by ID                   |
| PATCH  | `/api/jobs/{id}/close`          | Close a job listing                      |

### Applications

| Method | Endpoint                                     | Description                        |
|--------|----------------------------------------------|------------------------------------|
| POST   | `/api/jobs/{id}/applications`                | Apply to a job                     |
| GET    | `/api/jobs/{id}/applications`                | List applications (filter by status) |
| PATCH  | `/api/applications/{id}/status`              | Update application status          |
| GET    | `/api/applications/{id}/history`             | Get status change history          |

### Analytics

| Method | Endpoint      | Description                       |
|--------|---------------|-----------------------------------|
| GET    | `/api/stats`  | Get live analytics/statistics     |

---

## Application Status Workflow

```
pending ──→ shortlisted ──→ offered
   │              │              │
   ▼              ▼              ▼
rejected      rejected       rejected
```

### Valid Transitions

| From        | To          | ✓/✗ |
|-------------|-------------|-----|
| pending     | shortlisted | ✓   |
| pending     | rejected    | ✓   |
| shortlisted | offered     | ✓   |
| shortlisted | rejected    | ✓   |
| offered     | rejected    | ✓   |
| rejected    | *anything*  | ✗   |
| shortlisted | pending     | ✗   |
| offered     | pending     | ✗   |
| offered     | shortlisted | ✗   |

Every transition requires a `note` (string) from the hiring manager. The system records the old status, new status, note, and timestamp in the `ApplicationHistory` table — creating a full audit trail.

---

## Deliberate Ambiguity Resolutions

### 1. Duplicate Applications (same email + same job)

**Decision:** Permanently blocked. A unique constraint on `(job_id, email)` prevents the same email from applying to the same job more than once — even if the first application was rejected.

**Reasoning:** In a real hiring pipeline, a rejected applicant has already been evaluated. Allowing re-application would create confusion in the status workflow and undermine the integrity of the audit log. If a manager wants to reconsider, they can update the existing application's status.

### 2. Pending Applications on Job Close

**Decision:** Auto-reject all pending applications when a job is manually closed. Each auto-rejected application receives a system-generated note: *"Auto-rejected: job listing was closed by hiring manager."*

**Reasoning:** Leaving applications in `pending` after a job is closed creates a dead-end state — the applicant would never receive a resolution. Auto-rejecting provides closure while preserving the audit trail. Applications already in `shortlisted` or `offered` status are left unchanged, as those represent active conversations.

### 3. max_applicants Cap Behaviour

**Decision:** When the cap is reached, the job simply stops accepting new applications. The listing remains "open" and visible in search results. Only a manual close action changes the job status to "closed."

**Reasoning:** The hiring manager should retain control over when to formally close a listing. The cap is a convenience limit, not a lifecycle trigger. The API returns a clear error message: *"This job has reached its maximum number of applicants."*

---

### Frontend Architecture

### Pages (Next.js App Router)

| Route                      | Page                                  | Description                            |
|---------------------------|----------------------------------------|----------------------------------------|
| `/`                        | `app/page.js`                          | Job listings with search/filter/paging |
| `/jobs/[id]`               | `app/jobs/[id]/page.js`                | Job detail + apply form                |
| `/jobs/[id]/applications`  | `app/jobs/[id]/applications/page.js`   | Applications pipeline view             |
| `/dashboard`               | `app/dashboard/page.js`                | Analytics dashboard                    |
| `/post-job`                | `app/post-job/page.js`                 | Job creation form                      |

### Reusable Components

| Component            | Purpose                                       |
|----------------------|-----------------------------------------------|
| `JobCard`            | Renders a job listing card in the browse view |
| `ApplicationRow`     | Renders a single application in the pipeline  |
| `StatusBadge`        | Color-coded badge for application status      |
| `PaginationControls` | Page navigation with prev/next buttons        |
| `FilterBar`          | Search, department, location, skill filters   |
| `ApplyForm`          | Application submission form                   |
| `PostJobForm`        | Job creation form for hiring managers         |
| `Layout`             | Shared page layout with navigation            |
