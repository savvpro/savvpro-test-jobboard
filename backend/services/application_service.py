from __future__ import annotations

from datetime import date
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from models import Application, Job, StatusHistory
from schemas import ApplicationCreate, ApplicationResponse, StatusUpdateRequest

# Valid forward transitions
VALID_TRANSITIONS: dict[str, list[str]] = {
    "pending": ["shortlisted", "rejected"],
    "shortlisted": ["offered", "rejected"],
    "offered": ["rejected"],
    "rejected": [],
}


def submit_application(db: Session, job_id: int, data: ApplicationCreate) -> Application:
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.is_closed:
        raise HTTPException(status_code=400, detail="Job listing is closed")
    if job.deadline < date.today():
        raise HTTPException(status_code=400, detail="Job listing deadline has passed")

    # Check max_applicants cap
    if job.max_applicants is not None:
        active_count = (
            db.query(Application)
            .filter(
                Application.job_id == job_id,
                Application.current_status != "rejected",
            )
            .count()
        )
        if active_count >= job.max_applicants:
            raise HTTPException(status_code=400, detail="Job listing has reached the maximum number of applicants")

    # Duplicate check: same email + same job — block if any non-rejected application exists
    existing = (
        db.query(Application)
        .filter(
            Application.job_id == job_id,
            Application.email == data.email,
        )
        .first()
    )
    if existing:
        if existing.current_status != "rejected":
            raise HTTPException(
                status_code=409,
                detail="An active application from this email already exists for this job",
            )
        # Previous application was rejected — allow reapplication by creating a new record

    app = Application(
        job_id=job_id,
        applicant_name=data.applicant_name,
        email=data.email,
        years_experience=data.years_experience,
        cv_summary=data.cv_summary,
        linkedin_url=data.linkedin_url,
        current_status="pending",
    )
    db.add(app)
    db.flush()

    initial_history = StatusHistory(
        application_id=app.id,
        status="pending",
        note="Application submitted",
    )
    db.add(initial_history)
    db.commit()
    db.refresh(app)
    return app


def list_applications(db: Session, job_id: int, status: Optional[str]) -> list[Application]:
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    query = db.query(Application).filter(Application.job_id == job_id)
    if status:
        query = query.filter(Application.current_status == status)
    return query.all()


def get_application(db: Session, application_id: int) -> Application:
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app


def update_status(db: Session, application_id: int, data: StatusUpdateRequest) -> Application:
    app = get_application(db, application_id)

    allowed = VALID_TRANSITIONS.get(app.current_status, [])
    if data.status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition from '{app.current_status}' to '{data.status}'. "
                   f"Allowed transitions: {allowed}",
        )

    app.current_status = data.status
    history = StatusHistory(
        application_id=app.id,
        status=data.status,
        note=data.note,
    )
    db.add(history)
    db.commit()
    db.refresh(app)
    return app
