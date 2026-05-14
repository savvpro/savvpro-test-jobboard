from __future__ import annotations

from datetime import date
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from models import Application, Job, StatusHistory
from schemas import ApplicationCreate, StatusUpdateRequest

TRANSITIONS: dict[str, list[str]] = {
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
        raise HTTPException(status_code=409, detail="Job listing is closed")

    if job.deadline < date.today():
        raise HTTPException(
            status_code=409,
            detail=f"Job application deadline has passed ({job.deadline})",
        )

    if job.max_applicants is not None:
        count = db.query(Application).filter(Application.job_id == job_id).count()
        if count >= job.max_applicants:
            raise HTTPException(
                status_code=409,
                detail="Job listing has reached the maximum number of applicants",
            )

    existing = (
        db.query(Application)
        .filter(Application.job_id == job_id, Application.email == data.email)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail="An application from this email already exists for this job",
        )

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

    db.add(StatusHistory(
        application_id=app.id,
        from_status=None,
        to_status="pending",
        note="Application submitted",
    ))
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

    allowed = TRANSITIONS.get(app.current_status, [])
    if data.new_status not in allowed:
        raise HTTPException(
            status_code=422,
            detail=f"Cannot transition from {app.current_status} to {data.new_status}",
        )

    prev_status = app.current_status
    app.current_status = data.new_status
    db.add(StatusHistory(
        application_id=app.id,
        from_status=prev_status,
        to_status=data.new_status,
        note=data.note,
    ))
    db.commit()
    db.refresh(app)
    return app
