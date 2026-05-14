# Architecture — JobBoard Pro

---

## Data Model

### Entity Relationship Overview

Three tables with two foreign key relationships:

```
jobs (1) ──────< applications (1) ──────< status_history
        job_id FK                application_id FK
```

### Table: jobs
| Column | Type | Notes |
|---|---|---|
| id | Integer PK | Auto-increment |
| title | String | Required |
| department | String | Required |
| description | Text | Required |
| location | Enum | `remote` / `hybrid` / `onsite` |
| salary_min | Integer | Required |
| salary_max | Integer | salary_min < salary_max enforced |
| required_skills | JSON | List of strings, min 1 |
| max_applicants | Integer | Nullable |
| deadline | Date | Required |
| is_closed | Boolean | Default false |
| created_at | DateTime | Auto |

### Table: applications
| Column | Type | Notes |
|---|---|---|
| id | Integer PK | Auto-increment |
| job_id | FK → jobs.id | Required |
| applicant_name | String | Required |
| email | String | Required, valid email |
| years_experience | Integer | ≥ 0 |
| cv_summary | Text | Max 1000 chars |
| linkedin_url | String | Nullable, must start with `https://linkedin.com/` |
| status | Enum | `pending` / `shortlisted` / `offered` / `rejected` |
| created_at | DateTime | Auto |

### Table: status_history
| Column | Type | Notes |
|---|---|---|
| id | Integer PK | Auto-increment |
| application_id | FK → applications.id | Required |
| from_status | String | Previous status |
| to_status | String | New status |
| note | Text | Required, manager's note |
| changed_at | DateTime | Auto |

**Design note on status_history:** Status is stored as a plain string in the `applications` table (denormalized current state) AND as a log in `status_history`. This is intentional — it allows O(1) current-status reads without joining the history table, while still preserving a full audit trail. A pure event-sourced design would compute current status from history, but that optimisation is unnecessary at this scale.

---

## Status Workflow

```
                ┌──────────┐
                │  pending │
                └────┬─────┘
              ┌──────┴──────┐
              ▼             ▼
       ┌────────────┐  ┌──────────┐
       │ shortlisted│  │ rejected │ (terminal)
       └──────┬─────┘  └──────────┘
         ┌────┴────┐
         ▼         ▼
    ┌─────────┐ ┌──────────┐
    │ offered │ │ rejected │ (terminal)
    └────┬────┘ └──────────┘
         ▼
    ┌──────────┐
    │ rejected │ (terminal — offered can still be rejected)
    └──────────┘
```

Valid transitions implemented as a state machine dictionary:
```python
VALID_TRANSITIONS = {
    "pending":     ["shortlisted", "rejected"],
    "shortlisted": ["offered", "rejected"],
    "offered":     ["rejected"],
    "rejected":    [],
}
```

Any transition not in this map returns HTTP 400 with a descriptive error.

---

## API Design Rationale

**Why REST, not GraphQL?**  
The API surface is small and well-defined. REST with explicit endpoints is more transparent to evaluate and debug than GraphQL for a system of this scale.

**Why PATCH for status updates instead of PUT?**  
Status updates are partial modifications — we're changing one field, not replacing the entire resource. PATCH is semantically correct per RFC 5789.

**Why is /api/jobs/{id}/apply a POST to the jobs router, not a POST to /api/applications?**  
Because the application is a child resource of the job — it only exists in the context of a specific job. The nested URL makes this relationship explicit and keeps routing semantically clean.

**HTTP Status Code Decisions:**
- `201` on successful creation (not 200) — correct per RFC 7231
- `409 Conflict` for duplicate applications — semantically accurate; the server understands the request but cannot fulfill it due to the current state of the resource
- `422` for business rule violations (closed job, expired deadline, cap reached) — Pydantic also uses 422 for validation errors; consistent status code family
- `400` for invalid state transitions — bad request because the client sent a logically invalid state change

---

## Ambiguity Decisions

### Decision 1 — Duplicate Applications

**Decision:** Block duplicate applications permanently. Same email + same job_id returns `409 Conflict`, even if the previous application was rejected.

**Reasoning:** Allowing re-applications after rejection introduces gaming behaviour — an applicant could submit poor-quality work, get rejected, then reapply with an improved CV. The block is permanent and unconditional. This is consistent with how most real ATS systems work. The error message `"You have already applied to this position."` is deliberately vague — it doesn't tell the applicant whether they were rejected, protecting pipeline confidentiality.

---

### Decision 2 — Pending Applications on Job Close

**Decision:** When a job is manually closed, all `pending` applications are automatically transitioned to `rejected` with a system-generated note: `"This position has been closed by the hiring manager."` Applications in `shortlisted` or `offered` status are left untouched.

**Reasoning:** Leaving pending applications as "pending" indefinitely after a job closes would create a confusing limbo state — applicants could never receive a final decision. Auto-rejection is the honest and complete approach. Shortlisted and offered candidates, however, are in active consideration by the hiring manager and should not be impacted by the administrative act of closing the listing.

**Alternative considered:** Leave all applications in their current status and require manual action. Rejected because it creates operational debt — hiring managers would need to manually reject every pending applicant.

---

### Decision 3 — max_applicants Cap Behaviour

**Decision:** When `max_applicants` is reached, the job stops accepting new applications but remains open and visible. It does NOT auto-close. New applicants receive `422` with `"This position is no longer accepting applications."` Hiring managers can still update statuses and can manually close the listing.

**Reasoning:** Auto-closing conflates two distinct states: "not accepting applications" (a volume cap) vs "hiring is complete" (a deliberate manager decision). A hiring manager may want to review 50 CVs before deciding whether to close — they shouldn't lose that control because an arbitrary cap was hit. Keeping the listing visible also allows the hiring manager to adjust `max_applicants` upward if needed (future feature), without disrupting the workflow.

---

## Technology Choices

**SQLAlchemy 2.0 ORM (not raw SQL):**  
Type-safe, prevents SQL injection by construction, and makes the schema self-documenting through models. The slight performance overhead is irrelevant at this scale.

**Pydantic v2 for validation:**  
Zero-boilerplate validation with excellent error messages. `@model_validator` for cross-field rules (salary range) is cleaner than custom endpoint logic.

**Next.js 14 App Router:**  
Server components + streaming out of the box. While this app uses mostly client-side fetching (due to trust-based auth model), App Router is the correct choice for any production Next.js project going forward.

**No external services:**  
SQLite requires zero infrastructure. The entire stack runs from a single `git clone`. Deployment simplicity was a design constraint, not an afterthought.
