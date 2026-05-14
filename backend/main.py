"""
JobBoard Pro — FastAPI Backend
Main application with all API endpoints.
"""

import json
from datetime import date, datetime
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

import database
from database import get_db, Base
from models import Job, Application, ApplicationHistory
from schemas import (
    JobCreate, JobResponse, JobListResponse,
    ApplicationCreate, ApplicationResponse,
    StatusUpdate, HistoryEntry,
    StatsResponse,
)

# ── App instance ──
app = FastAPI(title="JobBoard Pro API", version="1.0.0")


@app.on_event("startup")
def on_startup():
    """Create database tables on first launch."""
    Base.metadata.create_all(bind=database.engine)

# ── CORS (allow Next.js frontend) ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Valid status transitions ──
VALID_TRANSITIONS = {
    "pending": {"shortlisted", "rejected"},
    "shortlisted": {"offered", "rejected"},
    "offered": {"rejected"},
    "rejected": set(),  # terminal state
}


# ══════════════════════════════════════════
# Helper to build a JobResponse from a Job model
# ══════════════════════════════════════════

def _job_to_response(job: Job, db: Session) -> JobResponse:
    """Convert a Job ORM object to a JobResponse schema."""
    app_count = db.query(func.count(Application.id)).filter(
        Application.job_id == job.id
    ).scalar()
    return JobResponse(
        id=job.id,
        title=job.title,
        department=job.department,
        description=job.description,
        location=job.location,
        salary_min=job.salary_min,
        salary_max=job.salary_max,
        required_skills=job.get_skills(),
        max_applicants=job.max_applicants,
        deadline=job.deadline,
        status=job.status,
        created_at=job.created_at,
        application_count=app_count,
    )


# ══════════════════════════════════════════
# FEATURE 1 — Post a Job Listing
# ══════════════════════════════════════════

@app.post("/api/jobs", response_model=JobResponse, status_code=201)
def create_job(payload: JobCreate, db: Session = Depends(get_db)):
    """Create a new job listing."""
    job = Job(
        title=payload.title,
        department=payload.department,
        description=payload.description,
        location=payload.location,
        salary_min=payload.salary_min,
        salary_max=payload.salary_max,
        max_applicants=payload.max_applicants,
        deadline=payload.deadline,
    )
    job.set_skills(payload.required_skills)
    db.add(job)
    db.commit()
    db.refresh(job)
    return _job_to_response(job, db)


# ══════════════════════════════════════════
# FEATURE 2 — Browse & Search Jobs with Pagination
# ══════════════════════════════════════════

@app.get("/api/jobs", response_model=JobListResponse)
def list_jobs(
    department: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    skill: Optional[str] = Query(None),
    include_closed: bool = Query(False),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Browse and search job listings with filters and pagination."""
    query = db.query(Job)

    # Exclude past-deadline or closed listings by default
    if not include_closed:
        query = query.filter(Job.status == "open", Job.deadline >= date.today())

    # Filter by department
    if department:
        query = query.filter(func.lower(Job.department) == department.lower())

    # Filter by location
    if location:
        query = query.filter(func.lower(Job.location) == location.lower())

    # Filter by skill (match if skill appears anywhere in required_skills JSON)
    if skill:
        query = query.filter(func.lower(Job.required_skills).contains(skill.lower()))

    # Total count before pagination
    total_count = query.count()

    # Apply pagination
    jobs = query.order_by(Job.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return JobListResponse(
        total_count=total_count,
        page=page,
        per_page=per_page,
        results=[_job_to_response(j, db) for j in jobs],
    )


# ── Get single job ──

@app.get("/api/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    """Get a single job listing by ID."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return _job_to_response(job, db)


# ══════════════════════════════════════════
# FEATURE 3 — Apply to a Job
# ══════════════════════════════════════════

@app.post("/api/jobs/{job_id}/applications", response_model=ApplicationResponse, status_code=201)
def apply_to_job(job_id: int, payload: ApplicationCreate, db: Session = Depends(get_db)):
    """Submit an application to a job listing."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Business rules
    if job.status == "closed":
        raise HTTPException(status_code=400, detail="This job listing is closed and no longer accepting applications")

    if date.today() > job.deadline:
        raise HTTPException(status_code=400, detail="The application deadline for this job has passed")

    # Check max_applicants cap
    if job.max_applicants is not None:
        current_count = db.query(func.count(Application.id)).filter(
            Application.job_id == job_id
        ).scalar()
        if current_count >= job.max_applicants:
            raise HTTPException(
                status_code=400,
                detail="This job has reached its maximum number of applicants",
            )

    # Check duplicate (same email + same job)
    existing = db.query(Application).filter(
        Application.job_id == job_id,
        func.lower(Application.email) == payload.email.lower(),
    ).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail="An application with this email already exists for this job",
        )

    # Create application
    application = Application(
        job_id=job_id,
        applicant_name=payload.applicant_name,
        email=payload.email,
        years_experience=payload.years_experience,
        cv_summary=payload.cv_summary,
        linkedin_url=payload.linkedin_url,
        status="pending",
    )
    db.add(application)
    db.flush()  # get the id

    # Record initial status in history
    history_entry = ApplicationHistory(
        application_id=application.id,
        old_status=None,
        new_status="pending",
        note="Application submitted",
    )
    db.add(history_entry)
    db.commit()
    db.refresh(application)

    return _app_to_response(application)


# ══════════════════════════════════════════
# FEATURE 4 — Application Status Workflow
# ══════════════════════════════════════════

@app.get("/api/jobs/{job_id}/applications", response_model=list[ApplicationResponse])
def list_applications(
    job_id: int,
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List all applications for a job, optionally filtered by status."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    query = db.query(Application).filter(Application.job_id == job_id)
    if status:
        query = query.filter(func.lower(Application.status) == status.lower())

    applications = query.order_by(Application.created_at.desc()).all()
    return [_app_to_response(a) for a in applications]


@app.patch("/api/applications/{app_id}/status", response_model=ApplicationResponse)
def update_application_status(
    app_id: int,
    payload: StatusUpdate,
    db: Session = Depends(get_db),
):
    """Update the status of an application following the workflow rules."""
    application = db.query(Application).filter(Application.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    current_status = application.status
    new_status = payload.status

    # Validate transition
    allowed = VALID_TRANSITIONS.get(current_status, set())
    if new_status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status transition: '{current_status}' → '{new_status}'. "
                   f"Allowed transitions from '{current_status}': {sorted(allowed) if allowed else 'none (terminal state)'}",
        )

    # Record history
    history_entry = ApplicationHistory(
        application_id=application.id,
        old_status=current_status,
        new_status=new_status,
        note=payload.note,
    )
    db.add(history_entry)

    # Update status
    application.status = new_status
    db.commit()
    db.refresh(application)

    return _app_to_response(application)


@app.get("/api/applications/{app_id}/history", response_model=list[HistoryEntry])
def get_application_history(app_id: int, db: Session = Depends(get_db)):
    """Get the full status change history for an application."""
    application = db.query(Application).filter(Application.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    entries = (
        db.query(ApplicationHistory)
        .filter(ApplicationHistory.application_id == app_id)
        .order_by(ApplicationHistory.changed_at.asc())
        .all()
    )
    return entries


# ══════════════════════════════════════════
# FEATURE 5 — Job Analytics Endpoint
# ══════════════════════════════════════════

@app.get("/api/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    """Return live computed analytics."""
    total_jobs = db.query(func.count(Job.id)).scalar()
    open_jobs = db.query(func.count(Job.id)).filter(Job.status == "open").scalar()
    closed_jobs = db.query(func.count(Job.id)).filter(Job.status == "closed").scalar()
    total_applications = db.query(func.count(Application.id)).scalar()

    avg_apps = 0.0
    if total_jobs > 0:
        avg_apps = round(total_applications / total_jobs, 2)

    # Top department by number of jobs
    top_dept_row = (
        db.query(Job.department, func.count(Job.id).label("cnt"))
        .group_by(Job.department)
        .order_by(func.count(Job.id).desc())
        .first()
    )
    top_department = top_dept_row[0] if top_dept_row else None

    return StatsResponse(
        total_jobs=total_jobs,
        open_jobs=open_jobs,
        closed_jobs=closed_jobs,
        total_applications=total_applications,
        avg_applications_per_job=avg_apps,
        top_department=top_department,
    )


# ══════════════════════════════════════════
# FEATURE 6 — Close a Job Listing
# ══════════════════════════════════════════

@app.patch("/api/jobs/{job_id}/close", response_model=JobResponse)
def close_job(job_id: int, db: Session = Depends(get_db)):
    """Close a job listing. Auto-rejects all pending applications."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status == "closed":
        raise HTTPException(status_code=400, detail="This job is already closed")

    job.status = "closed"

    # Auto-reject all pending applications
    pending_apps = (
        db.query(Application)
        .filter(Application.job_id == job_id, Application.status == "pending")
        .all()
    )
    for app_record in pending_apps:
        history_entry = ApplicationHistory(
            application_id=app_record.id,
            old_status="pending",
            new_status="rejected",
            note="Auto-rejected: job listing was closed by hiring manager.",
        )
        db.add(history_entry)
        app_record.status = "rejected"

    db.commit()
    db.refresh(job)
    return _job_to_response(job, db)


# ══════════════════════════════════════════
# Helper — Application to Response
# ══════════════════════════════════════════

def _app_to_response(application: Application) -> ApplicationResponse:
    """Convert an Application ORM object to an ApplicationResponse schema."""
    return ApplicationResponse(
        id=application.id,
        job_id=application.job_id,
        applicant_name=application.applicant_name,
        email=application.email,
        years_experience=application.years_experience,
        cv_summary=application.cv_summary,
        linkedin_url=application.linkedin_url,
        status=application.status,
        created_at=application.created_at,
        history=[
            HistoryEntry(
                id=h.id,
                old_status=h.old_status,
                new_status=h.new_status,
                note=h.note,
                changed_at=h.changed_at,
            )
            for h in sorted(application.history, key=lambda x: x.changed_at)
        ],
    )


# ── Health check ──

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "JobBoard Pro API"}
