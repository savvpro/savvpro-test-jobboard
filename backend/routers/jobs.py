from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from schemas import JobCreate, JobResponse, JobListResponse, StatsResponse
from services import job_service

router = APIRouter(prefix="/api/jobs", tags=["jobs"])
stats_router = APIRouter(prefix="/api", tags=["stats"])


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(data: JobCreate, db: Session = Depends(get_db)):
    job = job_service.create_job(db, data)
    return job_service._job_to_response(job)


@router.get("", response_model=JobListResponse)
def list_jobs(
    department: Optional[str] = None,
    location: Optional[str] = None,
    skill: Optional[str] = None,
    page: int = 1,
    per_page: int = 10,
    include_closed: bool = False,
    db: Session = Depends(get_db),
):
    return job_service.list_jobs(db, department, location, skill, page, per_page, include_closed)


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = job_service.get_job(db, job_id)
    return job_service._job_to_response(job)


@router.patch("/{job_id}/close", response_model=JobResponse)
def close_job(job_id: int, db: Session = Depends(get_db)):
    job = job_service.close_job(db, job_id)
    return job_service._job_to_response(job)


@stats_router.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    return job_service.get_stats(db)
