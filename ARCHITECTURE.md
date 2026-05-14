# Architecture — JobBoard Pro

## Data Model

Three tables, designed before any code was written:

### `jobs`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | Auto-increment |
| title | TEXT NOT NULL | Job title |
| department | TEXT NOT NULL | Department name |
| description | TEXT NOT NULL | Full description |
| location | ENUM | `remote` / `hybrid` / `onsite` |
| salary_min | INTEGER | Must be < salary_max |
| salary_max | INTEGER | |
| required_skills | TEXT (JSON) | JSON array stored as string |
| max_applicants | INTEGER nullable | Optional cap |
| deadline | DATE | Application deadline |
| is_closed | BOOLEAN | Default false |
| created_at | DATETIME | UTC timestamp |

### `applications`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| job_id | FK → jobs.id | |
| applicant_name | TEXT | |
| email | TEXT | Validated via Pydantic EmailStr |
| years_experience | INTEGER | Must be ≥ 0 |
| cv_summary | TEXT | Max 1000 chars |
| linkedin_url | TEXT nullable | Must start with https://linkedin.com/ |
| current_status | ENUM | `pending`/`shortlisted`/`offered`/`rejected` |
| created_at | DATETIME | |
| **UNIQUE(job_id, email)** | Constraint | Blocks duplicate applications |

### `status_history`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| application_id | FK → applications.id | |
| from_status | ENUM nullable | Null on first submission |
| to_status | ENUM | New status |
| note | TEXT NOT NULL | Mandatory manager note |
| changed_at | DATETIME | UTC timestamp |

---

## API Design

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/jobs` | Create a job listing |
| GET | `/api/jobs` | List jobs with filters + pagination |
| GET | `/api/jobs/{id}` | Get a single job |
| POST | `/api/jobs/{id}/close` | Close a job (auto-rejects pending apps) |
| POST | `/api/jobs/{id}/apply` | Submit an application |
| GET | `/api/jobs/{id}/applications` | List applications (optional `?status=`) |
| GET | `/api/applications/{id}` | Get a single application |
| PATCH | `/api/applications/{id}/status` | Update application status |
| GET | `/api/stats` | Live analytics |

---

## Status Transition Rules

```
pending → shortlisted → offered
   ↓           ↓           ↓
rejected    rejected    rejected
```

Implemented as a hardcoded dict:

```python
VALID_TRANSITIONS = {
    "pending":     ["shortlisted", "rejected"],
    "shortlisted": ["offered", "rejected"],
    "offered":     ["rejected"],
    "rejected":    [],
}
```

Every transition requires a non-empty `note`. All transitions are persisted in `status_history` — the current status is also denormalized onto `applications.current_status` for fast querying.

---

## Deliberate Ambiguities — Decisions & Reasoning

### 1. Duplicate Applications

**Decision:** Block permanently. Same `(job_id, email)` pair returns `409 Conflict`, regardless of the previous application's status (even if rejected).

**Reasoning:** The `UNIQUE(job_id, email)` constraint enforces this at the database level — it's clean, simple, and prevents applicants from gaming the system by re-applying after rejection. Hiring managers maintain a clean, non-duplicated pipeline. This is documented in error responses.

---

### 2. Pending Applications on Job Close

**Decision:** Auto-reject all `pending` applications when a job is manually closed, with note `"Job closed by hiring manager"`.

**Reasoning:** Leaving applications in `pending` state after a job closes is misleading to data consumers — the pipeline would have zombie entries with no path forward. Auto-rejecting keeps the pipeline clean and provides a clear audit trail in `status_history`. Applications already in `shortlisted` or `offered` state are left untouched (the hiring manager may still want to track those candidates for future roles).

---

### 3. max_applicants Cap Behaviour

**Decision:** The listing status stays `open` when the cap is hit — it does **not** auto-close. New `POST /apply` requests return `400` with a message. Only a hiring manager can explicitly close the job via `POST /api/jobs/{id}/close`.

**Reasoning:** Auto-closing on cap would be an irreversible side-effect that could surprise hiring managers. Keeping the listing `open` but rejecting new applications gives the manager full control — they can still see the listing, edit it (in a future version), and explicitly decide when to close.

---

## Validation Rules

| Field | Rule |
|---|---|
| salary_min / salary_max | `salary_min < salary_max` — enforced by Pydantic model validator |
| required_skills | Non-empty list |
| linkedin_url | Must start with `https://linkedin.com/` or `https://www.linkedin.com/` |
| email | Validated via `pydantic.EmailStr` |
| years_experience | Must be `>= 0` |
| cv_summary | Max 1000 characters |
| status note | Non-empty string (stripped) |
