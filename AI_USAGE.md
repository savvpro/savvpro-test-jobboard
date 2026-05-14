# AI Tool Usage Documentation

**AI Assistant Used:** Gemini

## Documented Prompts
*(Verbatim prompts used during development to architect the system phase-by-phase)*

1. **Prompt 1 (Setup & Feature 1):**
> Act as an expert Python developer using FastAPI. We are building the backend for JobBoard Pro using Python 3.14, `uv` for dependency management, and SQLite. Set up the basic FastAPI structure in a `/backend/app` folder. Create the SQLAlchemy model and Pydantic schemas for Feature 1: A "JobListing" with title, department, description, location (enum: remote, hybrid, onsite), salary_min, salary_max, required_skills (store as JSON/Text in SQLite), max_applicants (optional), deadline (date), and is_closed (boolean, default False). Enforce server-side validation in Pydantic so `salary_min` is strictly less than `salary_max`. Create the `POST /api/jobs` endpoint to create a job. Write a `pytest` file in `/tests/test_jobs.py` to verify job creation and validation.

2. **Prompt 2 (Browse & Search Jobs with Pagination):**
> Now, implement Feature 2 in our FastAPI app. Create a `GET /api/jobs` endpoint that returns all open, non-expired jobs. Add pagination using `page` and `per_page` query params. Add simultaneous filtering query parameters for: `department`, `location`, and `skill` (must match if the string exists inside the required_skills list). Add a boolean query flag `include_closed` (default false) to show past-deadline or manually closed listings. Update `/tests/test_jobs.py` to test this.

3. **Prompt 3 (Job Applications):**
> Implement Feature 3: Job Applications. Create SQLAlchemy models and Pydantic schemas for an "Application" (job_id, applicant_name, email, years_experience, cv_summary, linkedin_url, status). Create the `POST /api/jobs/{id}/apply` endpoint. Implement business rules: Return 400 if applying after deadline, closed job, or max_applicants reached. Enforce unique constraint on (job_id, email). Create `/tests/test_applications.py`.

4. **Prompt 4 (Application Status Workflow):**
> Implement the Application Status Workflow. Create an `ApplicationHistory` SQLAlchemy model. Create a `PATCH /api/applications/{id}/status` endpoint. Enforce strict transition rules: pending -> shortlisted -> offered. Any status can move to 'rejected'. No backwards transitions allowed (return 400). Whenever status changes, append a record to the history table. Create a `GET /api/jobs/{id}/applications` endpoint to list applications. Create `/tests/test_workflow.py`.

5. **Prompt 5 (Analytics and Job Close):**
> Implement the final backend features. Create `GET /api/stats` returning a JSON object: total_jobs, open_jobs, closed_jobs, total_applications, avg_applications_per_job, and top_department. Create `PATCH /api/jobs/{id}/close` to manually close a job. When closed, auto-reject all 'pending' applications and log the history entry. Create `/tests/test_analytics.py`.

6. **Prompt 6 (Frontend Scaffold):**
> Let's build the Next.js frontend using the App Router and Tailwind CSS. Initialize a clean structure. We need three main pages: `/` (Job listings), `/jobs/[id]` (Job detail and apply form), `/jobs/[id]/applications` (Pipeline management), and `/dashboard` (Analytics). Generate reusable components: `JobCard`, `ApplicationRow`, `StatusBadge`, and `PaginationControls`. Wire up the `/` page to fetch from `http://localhost:8000/api/jobs`.

## AI Errors & Real-Time Corrections

1. **Error: Next.js 15 Promise Resolution for URL Params**
   * **Issue:** The AI generated dynamic route params (e.g., `params.id`) and search parameters (e.g., `searchParams.page`) using standard synchronous access. In Next.js 15, these APIs were made asynchronous, resulting in terminal errors: `searchParams is a Promise and must be unwrapped`.
   * **Correction:** I refactored the frontend code to properly `await searchParams` in Server Components and used `React.use(params)` to unwrap dynamic route parameters inside Client Components.

2. **Error: Cross-Origin Resource Sharing (CORS) Block**
   * **Issue:** The AI provided the FastAPI routing but neglected to configure CORS, resulting in the Next.js frontend (Port 3000) failing to fetch data from the FastAPI backend (Port 8000) due to browser security policies.
   * **Correction:** I manually imported `CORSMiddleware` into `main.py` and configured `allow_origins=["http://localhost:3000"]` to securely bridge the two applications.

3. **Error: SQLite In-Memory Threading Context during Pytest**
   * **Issue:** When running FastAPI `POST` requests against the `:memory:` database in Pytest, the app threw 400 Bad Request errors. The AI initially failed to account for SQLite dropping tables when multiple threads/connections hit the same memory instance.
   * **Correction:** I updated the testing database configuration to include `poolclass=StaticPool` and `connect_args={"check_same_thread": False}`, ensuring all test client connections shared the exact same memory space.

4. **Error: TypeScript vs. Python Syntax Bleed**
   * **Issue:** After extensively generating Python backend code, the AI accidentally hallucinated Python type hints (`int`, `str`) into the React TypeScript components (e.g., `skill: str` instead of `skill: string`).
   * **Correction:** I analyzed the VS Code compiler warnings and manually corrected the interface types to valid TypeScript primitives to restore the build state.