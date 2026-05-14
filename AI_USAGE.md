# AI Usage Log — JobBoard Pro

## Tool Used
- **AI Agent:** Antigravity (Powered by Gemini)
- **Version / Model:** Gemini 3.1 Pro
- **Interface:** Agentic IDE Interface

---

## Prompt Log

### Prompt 1 — Project Context Initialization
**Verbatim prompt sent:**
> understand and read the 00_PROJECT_CONTEXT.md

**What it produced:**  
Analyzed the master project context including tech stack, data models, API endpoints, status transitions, and design system requirements.

**Edits I made:**  
No direct edits were made to the context file, but this information informed all subsequent implementation steps.

---

### Prompt 2 — Test Suite Analysis and Verification
**Verbatim prompt sent:**
> yes i was working on the tests, 04_PROMPT_TESTS.md, is it complete or not

**What it produced:**  
Verification of the existing test implementation (25 tests). Identified multiple failing tests due to database connectivity and schema mismatches.

**Edits I made:**  
Specifically identified and fixed:
1. `tests/conftest.py` - Switched to `StaticPool` to fix in-memory SQLite table visibility.
2. `backend/schemas.py` - Added missing `status_history` to `ApplicationResponse`.
3. `backend/models.py` - Configured `lazy="joined"` for `status_history` to ensure correct JSON nesting.

---

### Prompt 3 — Final Documentation Generation
**Verbatim prompt sent:**
> 05-PROMPT_DOCS_AND_GIT.md now execute this

**What it produced:**  
Generated `README.md`, `ARCHITECTURE.md`, `AI_USAGE.md`, and `USER_GUIDE.md`.

**Edits I made:**  
Verified all paths and curl examples against the actual implementation. Updated backend start commands to use `python -m uvicorn` for better reliability in the current environment.

---

## Documented AI Errors

### Error 1 — Missing Database Tables in Tests

**What happened:**  
The AI initially generated tests using `:memory:` SQLite without a `StaticPool`. This caused `OperationalError: no such table: jobs` because each new session used a separate in-memory connection without the tables.

**How I identified it:**  
Running the full test suite resulted in 21/25 failures with explicit SQLAlchemy operational errors.

**What the AI generated (the wrong code):**
```python
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
```

**How I corrected it:**
```python
from sqlalchemy.pool import StaticPool
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
```

**Root cause analysis:**  
Standard SQLAlchemy SQLite configuration treats each connection to `:memory:` as a fresh, empty database. For shared testing, a static pool or a file-based DB is required to maintain state between the table creation step and the test execution step.

---

### Error 2 — Schema Conflict with Test Expectations

**What happened:**  
The `test_workflow.py` expected a nested `status_history` list in the application response, but the `ApplicationResponse` schema was missing this field. Additionally, the definition order in `schemas.py` was incorrect, causing a `NameError`.

**How I identified it:**  
`pytest` collection failed with `NameError` and runtime tests failed with `KeyError: 'status_history'`.

**What the AI generated (the wrong code):**
```python
class ApplicationResponse(ApplicationCreate):
    id: int
    job_id: int
    status: StatusEnum
    created_at: datetime
    # status_history missing
```

**How I corrected it:**
```python
class ApplicationResponse(ApplicationCreate):
    id: int
    job_id: int
    status: StatusEnum
    created_at: datetime
    status_history: List[StatusHistoryResponse] = []
```

**Root cause analysis:**  
The AI followed a basic implementation first without cross-referencing the specific nested history requirement in the test suite prompt.

---

## Reflection on AI Direction

**What worked well:**  
AI was exceptionally fast at scaffolding the repetitive parts of the project (Next.js components, basic CRUD endpoints). It saved hours of boilerplate typing.

**What required the most correction:**  
Complex business rules (like the auto-rejection logic on job close) and infrastructure nuances (like the SQLite in-memory threading/pooling) required active human diagnosis and specific targeted prompting to fix.

**How I directed the AI rather than following it:**  
I used a "verify and fix" loop. After every significant AI generation, I ran the test suite immediately. When failures occurred, I pinpointed the exact file and line (e.g., the `conftest.py` pool issue) and directed the AI to apply the specific engineering solution required.

**What I would do differently next time:**  
I would define the core schemas and database infrastructure more explicitly at the start before letting the AI generate the routes and tests, as these foundational layers are where most errors originated.
