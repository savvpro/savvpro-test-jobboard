import json
from datetime import date, datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Application, Job, StatusHistory, StatusEnum
from ..schemas import JobCreate, JobListResponse, JobResponse

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


def _job_to_response(job: Job) -> dict:
    return {
        "id": job.id,
        "title": job.title,
        "department": job.department,
        "description": job.description,
        "location": job.location.value if hasattr(job.location, "value") else job.location,
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "required_skills": json.loads(job.required_skills),
        "max_applicants": job.max_applicants,
        "deadline": job.deadline,
        "is_closed": job.is_closed,
        "created_at": job.created_at,
    }


@router.post("", status_code=201, response_model=JobResponse)
def create_job(payload: JobCreate, db: Session = Depends(get_db)):
    job = Job(
        title=payload.title,
        department=payload.department,
        description=payload.description,
        location=payload.location,
        salary_min=payload.salary_min,
        salary_max=payload.salary_max,
        required_skills=json.dumps(payload.required_skills),
        max_applicants=payload.max_applicants,
        deadline=payload.deadline,
        is_closed=False,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return _job_to_response(job)


@router.get("", response_model=JobListResponse)
def list_jobs(
    department: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    skill: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    include_closed: bool = Query(False),
    db: Session = Depends(get_db),
):
    today = date.today()
    query = db.query(Job)

    if not include_closed:
        query = query.filter(Job.is_closed == False, Job.deadline >= today)

    if department:
        query = query.filter(Job.department.ilike(f"%{department}%"))

    if location:
        query = query.filter(Job.location == location)

    if skill:
        query = query.filter(Job.required_skills.ilike(f"%{skill}%"))

    total_count = query.count()
    jobs = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "total_count": total_count,
        "page": page,
        "per_page": per_page,
        "results": [_job_to_response(j) for j in jobs],
    }


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return _job_to_response(job)


@router.post("/{job_id}/close", response_model=JobResponse)
def close_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.is_closed:
        raise HTTPException(status_code=400, detail="Job is already closed")

    job.is_closed = True

    # Auto-reject all pending applications
    pending_apps = (
        db.query(Application)
        .filter(
            Application.job_id == job_id,
            Application.current_status == StatusEnum.pending,
        )
        .all()
    )
    now = datetime.now(timezone.utc)
    for app in pending_apps:
        history = StatusHistory(
            application_id=app.id,
            from_status=StatusEnum.pending,
            to_status=StatusEnum.rejected,
            note="Job closed by hiring manager",
            changed_at=now,
        )
        app.current_status = StatusEnum.rejected
        db.add(history)

    db.commit()
    db.refresh(job)
    return _job_to_response(job)
