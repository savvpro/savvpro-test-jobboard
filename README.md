# JobBoard Pro — Job Listings, Applications & Status Workflow

A full-stack internal hiring platform built with **FastAPI** (Python) and **Next.js** (React).

---

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at **http://localhost:8000**. API docs available at **http://localhost:8000/docs**.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:3000**.

### Running Tests

```bash
# From the project root
pip install pytest httpx
python -m pytest tests/test_api.py -v
```

---

## Project Structure

```
├── backend/               # FastAPI backend
│   ├── main.py            # API endpoints (all 6 features)
│   ├── models.py          # SQLAlchemy ORM models
│   ├── schemas.py         # Pydantic request/response schemas
│   ├── database.py        # Database configuration
│   └── requirements.txt   # Python dependencies
├── frontend/              # Next.js frontend
│   ├── app/               # App Router pages and global layout
│   │   ├── page.js        # Home — job listings, filters, pagination
│   │   ├── layout.js      # Root shell and top navigation
│   │   ├── dashboard/     # Analytics dashboard
│   │   ├── post-job/      # Create job form
│   │   └── jobs/[id]/     # Job detail & applications pipeline
│   ├── components/        # Reusable components
│   │   ├── JobCard.js
│   │   ├── ApplicationRow.js
│   │   ├── StatusBadge.js
│   │   └── PaginationControls.js
│   └── lib/api.js         # API client
├── tests/                 # Test suite (11 tests)
│   └── test_api.py
├── ARCHITECTURE.md        # Data model & API design
├── AI_USAGE.md            # AI tool usage documentation
├── USER_GUIDE.md          # How to use the app
├── TASK.md                # Original assessment brief
└── .gitignore
```

---

## Tech Stack

- **Backend:** Python 3.10+, FastAPI, SQLAlchemy, SQLite, Pydantic
- **Frontend:** Next.js 15, React 19, Tailwind CSS
- **Testing:** pytest, FastAPI TestClient

---

## Features

1. **Post a Job** — Create listings with title, department, salary, skills, deadline
2. **Browse & Search** — Filter by department, location, skill with pagination
3. **Apply** — Submit applications with email validation and duplicate detection
4. **Status Workflow** — pending → shortlisted → offered (with reject from any state)
5. **Analytics Dashboard** — Live computed stats from the database
6. **Close Jobs** — Manual close with auto-reject of pending applications

---

## Assumptions & Design Decisions

- **No authentication** — Trust-based system as specified in the brief
- **Duplicate applications blocked permanently** — Same email cannot apply twice to the same job
- **Auto-reject on close** — Pending applications are auto-rejected when a job is closed; shortlisted/offered are preserved
- **max_applicants cap** — Job stays "open" but stops accepting when cap is reached
- **SQLite** — Single-file database, no external services needed

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full details.
