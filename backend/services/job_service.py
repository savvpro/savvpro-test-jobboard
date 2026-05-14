from __future__ import annotations

from datetime import date, datetime
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException

from models import Job, Application, StatusHistory
from schemas import JobCreate, JobListResponse, JobResponse, StatsResponse


def create_job(db: Session, data: JobCreate) -> Job:
    job = Job(
        title=data.title,
        department=data.department,
        description=data.description,
        location=data.location,
        salary_min=data.salary_min,
        salary_max=data.salary_max,
        max_applicants=data.max_applicants,
        deadline=data.deadline,
        is_closed=False,
    )
    job.required_skills = data.required_skills
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def list_jobs(
    db: Session,
    department: Optional[str],
    location: Optional[str],
    skill: Optional[str],
    page: int,
    per_page: int,
    include_closed: bool,
) -> JobListResponse:
    query = db.query(Job)

    if not include_closed:
        query = query.filter(Job.is_closed == False, Job.deadline >= date.today())

    if department:
        query = query.filter(func.lower(Job.department) == department.lower())
    if location:
        query = query.filter(func.lower(Job.location) == location.lower())
    if skill:
        query = query.filter(Job._required_skills.ilike(f'%"{skill}"%'))

    total_count = query.count()
    jobs = query.offset((page - 1) * per_page).limit(per_page).all()

    return JobListResponse(
        total_count=total_count,
        page=page,
        per_page=per_page,
        results=[_job_to_response(j) for j in jobs],
    )


def get_job(db: Session, job_id: int) -> Job:
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


def close_job(db: Session, job_id: int) -> Job:
    job = get_job(db, job_id)
    if job.is_closed:
        raise HTTPException(status_code=400, detail="Job is already closed")

    job.is_closed = True

    # Auto-reject all pending applications
    pending_apps = (
        db.query(Application)
        .filter(Application.job_id == job_id, Application.current_status == "pending")
        .all()
    )
    for app in pending_apps:
        prev = app.current_status
        app.current_status = "rejected"
        db.add(StatusHistory(
            application_id=app.id,
            from_status=prev,
            to_status="rejected",
            note="Job listing closed by hiring manager.",
        ))

    db.commit()
    db.refresh(job)
    return job


def get_stats(db: Session) -> StatsResponse:
    total_jobs = db.query(Job).count()
    open_jobs = db.query(Job).filter(
        Job.is_closed == False, Job.deadline >= date.today()
    ).count()
    closed_jobs = total_jobs - open_jobs
    total_applications = db.query(Application).count()

    avg = round(total_applications / total_jobs, 2) if total_jobs > 0 else 0.0

    top_dept_row = (
        db.query(Job.department, func.count(Application.id).label("cnt"))
        .outerjoin(Application, Application.job_id == Job.id)
        .group_by(Job.department)
        .order_by(func.count(Application.id).desc())
        .first()
    )
    top_department = top_dept_row[0] if top_dept_row else None

    return StatsResponse(
        total_jobs=total_jobs,
        open_jobs=open_jobs,
        closed_jobs=closed_jobs,
        total_applications=total_applications,
        avg_applications_per_job=avg,
        top_department=top_department,
    )


def _job_to_response(job: Job) -> JobResponse:
    return JobResponse(
        id=job.id,
        title=job.title,
        department=job.department,
        description=job.description,
        location=job.location,
        salary_min=job.salary_min,
        salary_max=job.salary_max,
        required_skills=job.required_skills,
        max_applicants=job.max_applicants,
        deadline=job.deadline,
        is_closed=job.is_closed,
        created_at=job.created_at,
    )
