import json
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Application, Job, StatusEnum, StatusHistory
from ..schemas import ApplicationCreate, ApplicationResponse, StatusUpdate

router = APIRouter(tags=["applications"])

VALID_TRANSITIONS = {
    "pending": ["shortlisted", "rejected"],
    "shortlisted": ["offered", "rejected"],
    "offered": ["rejected"],
    "rejected": [],
}


def _app_to_response(app: Application) -> dict:
    return {
        "id": app.id,
        "job_id": app.job_id,
        "applicant_name": app.applicant_name,
        "email": app.email,
        "years_experience": app.years_experience,
        "cv_summary": app.cv_summary,
        "linkedin_url": app.linkedin_url,
        "current_status": app.current_status.value
        if hasattr(app.current_status, "value")
        else app.current_status,
        "created_at": app.created_at,
        "status_history": [
            {
                "id": h.id,
                "from_status": h.from_status.value
                if h.from_status and hasattr(h.from_status, "value")
                else h.from_status,
                "to_status": h.to_status.value
                if hasattr(h.to_status, "value")
                else h.to_status,
                "note": h.note,
                "changed_at": h.changed_at,
            }
            for h in app.status_history
        ],
    }


@router.post("/api/jobs/{job_id}/apply", status_code=201, response_model=ApplicationResponse)
def apply_to_job(
    job_id: int, payload: ApplicationCreate, db: Session = Depends(get_db)
):
    from datetime import date

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.is_closed:
        raise HTTPException(status_code=400, detail="This job listing is closed")

    if job.deadline < date.today():
        raise HTTPException(
            status_code=400,
            detail="Cannot apply — the application deadline has passed",
        )

    # Check max_applicants cap
    if job.max_applicants is not None:
        current_count = (
            db.query(Application).filter(Application.job_id == job_id).count()
        )
        if current_count >= job.max_applicants:
            raise HTTPException(
                status_code=400,
                detail="This job listing has reached its maximum number of applicants",
            )

    app = Application(
        job_id=job_id,
        applicant_name=payload.applicant_name,
        email=str(payload.email),
        years_experience=payload.years_experience,
        cv_summary=payload.cv_summary,
        linkedin_url=payload.linkedin_url,
        current_status=StatusEnum.pending,
    )
    db.add(app)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="An application from this email already exists for this job",
        )

    # Record initial status in history
    history = StatusHistory(
        application_id=app.id,
        from_status=None,
        to_status=StatusEnum.pending,
        note="Application submitted",
        changed_at=datetime.now(timezone.utc),
    )
    db.add(history)
    db.commit()
    db.refresh(app)
    return _app_to_response(app)


@router.get("/api/jobs/{job_id}/applications", response_model=list[ApplicationResponse])
def list_applications(
    job_id: int,
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    query = db.query(Application).filter(Application.job_id == job_id)

    if status:
        allowed = {e.value for e in StatusEnum}
        if status not in allowed:
            raise HTTPException(
                status_code=400, detail=f"Invalid status. Must be one of {allowed}"
            )
        query = query.filter(Application.current_status == status)

    apps = query.all()
    return [_app_to_response(a) for a in apps]


@router.get("/api/applications/{app_id}", response_model=ApplicationResponse)
def get_application(app_id: int, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return _app_to_response(app)


@router.patch("/api/applications/{app_id}/status", response_model=ApplicationResponse)
def update_status(
    app_id: int, payload: StatusUpdate, db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    current = (
        app.current_status.value
        if hasattr(app.current_status, "value")
        else app.current_status
    )
    new = payload.new_status

    if new not in VALID_TRANSITIONS.get(current, []):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition from '{current}' to '{new}'",
        )

    history = StatusHistory(
        application_id=app.id,
        from_status=app.current_status,
        to_status=new,
        note=payload.note,
        changed_at=datetime.now(timezone.utc),
    )
    app.current_status = new
    db.add(history)
    db.commit()
    db.refresh(app)
    return _app_to_response(app)
