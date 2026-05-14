# JobBoard Pro

JobBoard Pro is a premium job listing and application management platform built with FastAPI and Next.js.

## Features
- **Job Management**: Create, list, search, and close job listings.
- **Advanced Filtering**: Filter by department, location, and required skills.
- **Smart Application Flow**: Integrated validation for deadlines, max applicants, and duplicate applications.
- **Status Workflow**: Structured hiring pipeline (`pending` -> `shortlisted` -> `offered` / `rejected`) with mandatory history notes.
- **Analytics Dashboard**: Live stats on job performance and department activity.

## Tech Stack
- **Backend**: FastAPI, SQLite, SQLAlchemy, Pydantic.
- **Frontend**: Next.js 14, Tailwind CSS, TypeScript, Lucide Icons.

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend Setup
1. Navigate to `/backend`:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
2. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will be available at `http://localhost:8000`.

### Frontend Setup
1. Navigate to `/frontend`:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Next.js dev server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`.

### Running Tests
From the root directory:
```bash
pytest tests/
```

## Documentation
- [Architecture](ARCHITECTURE.md) - Data models and ambiguity resolutions.
- [AI Usage](AI_USAGE.md) - Prompts and error logs.
- [User Guide](USER_GUIDE.md) - Usage instructions and API examples.
