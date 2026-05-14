# JobBoard Pro

A full-stack job listing and application management platform built with **FastAPI** (Python) and **Next.js** (TypeScript).

---

## Tech Stack

| Layer    | Technology                  |
|----------|-----------------------------|
| Backend  | FastAPI · SQLAlchemy · SQLite |
| Frontend | Next.js 15 · TypeScript · Vanilla CSS |
| Tests    | pytest · httpx · TestClient |

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm

---

## Backend Setup

```bash
# From project root
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt

# Start the API server
uvicorn backend.main:app --reload --port 8000
```

API is live at: http://localhost:8000  
Interactive docs: http://localhost:8000/docs

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App is live at: http://localhost:3000

---

## Running Tests

```bash
# From project root (with venv activated)
pytest tests/ -v
```

---

## Project Structure

```
savvpro-test-jobboard/
├── backend/
│   ├── main.py          ← FastAPI app entry point
│   ├── database.py      ← SQLAlchemy engine & session
│   ├── models.py        ← Job, Application, StatusHistory ORM models
│   ├── schemas.py       ← Pydantic request/response schemas
│   └── routers/
│       ├── jobs.py         ← POST /api/jobs, GET /api/jobs, etc.
│       ├── applications.py ← POST /apply, PATCH /status, etc.
│       └── stats.py        ← GET /api/stats
├── frontend/
│   ├── app/
│   │   ├── page.tsx                         ← Job listings
│   │   ├── dashboard/page.tsx               ← Analytics
│   │   └── jobs/[id]/
│   │       ├── page.tsx                     ← Job detail + apply form
│   │       └── applications/page.tsx        ← Pipeline view
│   ├── components/
│   │   ├── JobCard.tsx
│   │   ├── ApplicationRow.tsx
│   │   ├── StatusBadge.tsx
│   │   └── PaginationControls.tsx
│   └── lib/api.ts        ← Typed API client
└── tests/
    └── test_main.py      ← 10 pytest tests
```

---

## Environment Variables

Create a `.env` file in `frontend/` if you need to override the API URL:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Assumptions

- No authentication — manager actions are trust-based as per spec
- SQLite database file (`jobboard.db`) is created on first run in `/backend/`
- The frontend connects directly to FastAPI via fetch (no Next.js API proxy)
