# AI Usage — JobBoard Pro

## Tools Used

- **Gemini Code Assist (Antigravity)** — Primary AI coding agent used throughout the entire project.
- Model: Gemini 3 Flash → Claude Opus 4.6 (switched mid-session for complex implementation).

---

## Verbatim Prompts

### Prompt 1 — Initial Analysis
```
I have to complete the task. Check the instructions in the md file. I have made the frontend with stitch. Now I have to code this with respect to the instructions. First read them and understand it so I can move forward. Also currently I am on gemini model, if I switch to opus after this prompt will it remember the info?
```
**What happened:** The AI read and analyzed the `TASK.md` file, understood all 6 features, and proposed an initial architecture plan including the data model, API design, and ambiguity resolutions. It confirmed that switching models mid-conversation retains context.

### Prompt 2 — Full Implementation
```
complete this task. You have everything you need. Make sure each and every instruction is implemented. Keep in mind the tech stack. also I have to make some commits as required by the instructions
```
**What happened:** The AI scaffolded the entire backend (FastAPI + SQLAlchemy + SQLite) and frontend (Next.js) from scratch, creating all models, schemas, endpoints, components, pages, and tests.

### Prompt 3 — Database Patching for Tests
```
Fix the test database setup: import Base and models properly so tables are created on the test engine, not the production engine.
```
**What happened:** The AI attempted multiple approaches to isolate the test database. Initial attempts failed because SQLite in-memory databases are per-connection. After debugging, the AI identified that `StaticPool` was needed to share a single in-memory database across all connections in tests.

### Prompt 4 — Status Workflow Design
```
Implement a status transition system with valid statuses and transitions: pending → shortlisted → offered, with rejected as a terminal state from any position. Every status change requires a note from the hiring manager. Status history must be preserved as a log of events.
```
**What happened:** The AI created the `VALID_TRANSITIONS` dictionary, the `ApplicationHistory` model, and the `PATCH /api/applications/{id}/status` endpoint with full validation and audit logging.

### Prompt 5 — Frontend Component Architecture
```
Create reusable Next.js components for the job board: JobCard for the browse grid, ApplicationRow for the pipeline table with inline status update controls, StatusBadge for color-coded status display, and PaginationControls for page navigation. All must use the dark theme design system.
```
**What happened:** The AI created all four required components plus additional ones (FilterBar, ApplyForm, PostJobForm), each under 300 lines, with consistent styling using CSS custom properties.

---

## AI Errors and Corrections

### Error 1 — In-Memory SQLite Test Isolation

**The error:** When running tests with `pytest`, all 10 tests failed with `sqlalchemy.exc.OperationalError: no such table: jobs`. The AI's initial approach was to monkey-patch `database.engine` and `database.SessionLocal` before importing `main.py`, but this didn't work because SQLite in-memory databases create a **separate database per connection**.

**Root cause:** The `create_engine("sqlite:///:memory:")` default pool creates a new connection for each session, and each connection gets its own empty database. So `Base.metadata.create_all()` created tables on one connection, but the test requests used a different connection with no tables.

**The fix:** Added `poolclass=StaticPool` to the test engine, which forces all sessions to share the same underlying database connection:
```python
from sqlalchemy.pool import StaticPool

TEST_ENGINE = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
```
This ensures tables created by `create_all()` are visible to all test sessions.

### Error 2 — FastAPI Startup Event Not Firing in Tests

**The error:** After moving `Base.metadata.create_all(bind=engine)` from module-level to a `@app.on_event("startup")` handler, tests still failed because `TestClient(app)` without a context manager does NOT trigger startup events.

**Root cause:** FastAPI's `on_event("startup")` only fires when the ASGI app is properly initialized through a lifespan context — which `TestClient` only does inside a `with` block.

**The fix:** Changed the test fixture to use `with TestClient(app) as tc:` context manager, and also made the test independently create tables via `Base.metadata.create_all(bind=TEST_ENGINE)` in the `setup_db` fixture, so tests don't depend on the startup event at all.

---

## AI-Assisted Design Decisions

1. The AI suggested using JSON-encoded strings for `required_skills` instead of a separate join table, which was appropriate for SQLite's simplicity constraints.
2. The AI designed the `ApplicationHistory` table to include `old_status` (nullable for initial creation) alongside `new_status`, creating a complete audit trail.
3. The AI recommended `StaticPool` for test database isolation — a non-obvious SQLAlchemy pattern that was discovered through iterative debugging.
