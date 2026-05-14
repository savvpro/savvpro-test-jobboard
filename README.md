# JobBoard Pro

A full-stack internal hiring platform built with FastAPI + Next.js.
Hiring managers post roles, manage applicant pipelines, and track status transitions.
Applicants browse open listings and submit applications — no login required.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Python 3.11 · FastAPI · SQLAlchemy  |
| Database   | SQLite (auto-created on first run)  |
| Frontend   | Next.js 14 (App Router) · TypeScript |
| Styling    | Tailwind CSS · Custom design system |
| Testing    | pytest · httpx · FastAPI TestClient |

---

## Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- npm 9+
- Git

---

## Project Structure

```
jobboard-pro/
├── backend/
│   ├── main.py               # FastAPI app entry point
│   ├── database.py           # SQLAlchemy engine + session
│   ├── models.py             # ORM models
│   ├── schemas.py            # Pydantic request/response schemas
│   ├── routers/
│   │   ├── jobs.py           # Job listing endpoints
│   │   ├── applications.py   # Application endpoints
│   │   └── stats.py          # Analytics endpoint
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx                          # / — Job listings + search + filter + pagination
│   │   ├── dashboard/page.tsx               # /dashboard — Analytics
│   │   ├── jobs/[id]/page.tsx               # /jobs/[id] — Job detail + apply form
│   │   └── jobs/[id]/applications/page.tsx  # /jobs/[id]/applications — Pipeline view
│   ├── components/
│   │   ├── JobCard.tsx
│   │   ├── ApplicationRow.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── PaginationControls.tsx
│   │   ├── ApplyForm.tsx
│   │   ├── FilterBar.tsx
│   │   └── DashboardStat.tsx
│   ├── lib/
│   │   └── api.ts            # All fetch wrappers to FastAPI
│   ├── package.json
│   └── tailwind.config.ts
├── tests/
│   ├── test_jobs.py
│   ├── test_applications.py
│   └── test_workflow.py
├── README.md
├── ARCHITECTURE.md
├── AI_USAGE.md
└── USER_GUIDE.md
```

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/malik-shaheer03/railway-construction-management-system.git
cd savvpro-test-jobboard
git checkout candidate-malik-shaheer03
```

### 2. Start the Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Backend runs at: **http://localhost:8000**
Interactive API docs: **http://localhost:8000/docs**

The SQLite database (`jobboard.db`) is auto-created in `/backend/` on first run.

### 3. Start the Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## Environment Variables

None required. SQLite is file-based and auto-initialised. 
No `.env` file needed to run this project.

---

## Running Tests

```bash
# From the project root
python -m pytest -v
```

All 25 tests use an isolated in-memory SQLite database — they will not affect your local `jobboard.db`.

---

## Available Pages

| URL | Description |
|-----|-------------|
| `/` | Browse open job listings with search and filters |
| `/jobs/[id]` | Job detail page with inline application form |
| `/jobs/[id]/applications` | Hiring pipeline view with status management |
| `/dashboard` | Live hiring analytics |

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/jobs` | Create a job listing |
| GET | `/api/jobs` | Browse & search jobs (paginated) |
| GET | `/api/jobs/{id}` | Get single job |
| POST | `/api/jobs/{id}/apply` | Submit an application |
| PATCH | `/api/jobs/{id}/close` | Close a job listing |
| GET | `/api/jobs/{id}/applications` | List applications (filterable) |
| PATCH | `/api/applications/{id}/status` | Update application status |
| GET | `/api/stats` | Hiring analytics |

Full interactive docs available at `http://localhost:8000/docs`.

---

## Assumptions & Constraints

- No authentication system — manager actions are trust-based (by design, per spec)
- SQLite only — no external database required
- All AI usage documented in `AI_USAGE.md`
- Architecture decisions documented in `ARCHITECTURE.md`
