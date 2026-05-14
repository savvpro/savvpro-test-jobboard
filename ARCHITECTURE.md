# Architecture & Design Decisions

## 1. High-Level System Architecture

The application follows a decoupled, client-server architecture, separating the presentation layer from the business logic and data persistence layers.

* **Frontend (Presentation Layer):** Built with Next.js 15 (App Router) and React. It utilizes Server Components for initial data fetching (SEO and performance optimization) and Client Components for interactive UI elements (forms, filtering, status updates). Styling is handled via Tailwind CSS for rapid, responsive design.
* **Backend (API Layer):** Built with FastAPI (Python). It serves a RESTful API, handling route parsing, Pydantic data validation, and business logic enforcement.
* **Database (Persistence Layer):** SQLite, interacted with via SQLAlchemy (ORM). Chosen for zero-configuration, lightweight local development while maintaining relational data integrity.

## 2. Backend Design Patterns

The FastAPI backend is structured using a standard multi-layer pattern to maintain separation of concerns:
* **Routers/Endpoints (`main.py`):** Handle HTTP requests, CORS configurations, and dependency injection.
* **Schemas (`schemas.py`):** Pydantic models for strict request/response data validation and serialization.
* **CRUD Operations (`crud.py`):** Encapsulates all database querying and complex business logic (e.g., stats aggregation, state transitions).
* **Models (`models.py`):** SQLAlchemy ORM definitions mapping directly to the SQLite tables.

## 3. Data Model

1. **JobListing**: `id`, `title`, `department`, `description`, `location`, `salary_min`, `salary_max`, `required_skills` (JSON), `max_applicants`, `deadline`, `is_closed` (boolean).
2. **Application**: `id`, `job_id` (FK), `applicant_name`, `email`, `years_experience`, `cv_summary`, `linkedin_url`, `status`.
3. **ApplicationHistory**: `id`, `application_id` (FK), `previous_status`, `new_status`, `manager_note`, `changed_at` (timestamp).

## 4. Resolved Ambiguities & Business Logic

1. **Duplicate Applications**: 
    * **Decision:** Blocked permanently per job listing.
    * **Reasoning:** A single email address cannot apply to the same Job ID more than once, regardless of their current status (even if rejected). This prevents spamming the hiring manager. The database enforces a unique constraint on `(job_id, email)`.

2. **Pending Applications on Job Close**: 
    * **Decision:** Auto-reject.
    * **Reasoning:** When a hiring manager manually closes a job listing, all applications currently in the `pending` state are automatically transitioned to `rejected`. A system-generated entry is added to the `ApplicationHistory` with the note: "System auto-rejection: Job listing was manually closed." Applications already in `shortlisted` or `offered` remain untouched.

3. **Max Applicants Cap Behaviour**: 
    * **Decision:** Stops accepting, remains open.
    * **Reasoning:** When the `max_applicants` cap is reached, the job listing status remains "open" (visible in the UI), but the API rejects new applications with a 400 error ("Application cap reached"). It does not auto-close, allowing the manager to review the current pool before deciding to officially close it.

4. **Workflow Transitions**:
    * **Decision:** Strict forward-only progression.
    * **Reasoning:** Hiring managers can only move candidates forward (`pending` -> `shortlisted` -> `offered`) or move them to a terminal `rejected` state from any point. Backwards transitions (e.g., `offered` back to `shortlisted`) are strictly blocked by the backend to prevent pipeline contamination.