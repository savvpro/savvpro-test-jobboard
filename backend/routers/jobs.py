"""
Jobs Router - Handles job listings and applications.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, String
from typing import Optional
from datetime import date

from database import get_db
from models import Job, Application, StatusHistory
from schemas import JobCreate, JobResponse, JobListResponse, ApplicationCreate, ApplicationResponse

router = APIRouter(tags=["jobs"])

@router.post("/jobs", response_model=JobResponse, status_code=201)
def create_job(job: JobCreate, db: Session = Depends(get_db)):
    if job.salary_min >= job.salary_max:
        raise HTTPException(status_code=422, detail="salary_min must be strictly less than salary_max")
        
    db_job = Job(**job.model_dump())
    
    try:
        db.add(db_job)
        db.commit()
        db.refresh(db_job)
        return db_job
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create job: {str(e)}")

@router.get("/jobs", response_model=JobListResponse)
def list_jobs(
    department: Optional[str] = None,
    location: Optional[str] = None,
    skill: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=10, ge=1, le=100),
    include_closed: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Job)
    today = date.today()
    
    if not include_closed:
        query = query.filter(Job.is_closed == False, Job.deadline >= today)
        
    if department:
        query = query.filter(func.lower(Job.department) == department.lower())
    if location:
        query = query.filter(Job.location == location)
    if skill:
        # We cast JSON to String for a simple un-indexed substring match 
        # (Suitable for SQLite JSON structure in this test)
        query = query.filter(cast(Job.required_skills, String).ilike(f"%{skill}%"))
        
    total_count = query.count()
    results = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return {
        "total_count": total_count,
        "page": page,
        "per_page": per_page,
        "results": results
    }

@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    db_job = db.query(Job).filter(Job.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    return db_job

@router.patch("/jobs/{job_id}/close", response_model=JobResponse)
def close_job(job_id: int, db: Session = Depends(get_db)):
    db_job = db.query(Job).filter(Job.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    if db_job.is_closed:
        raise HTTPException(status_code=400, detail="This job is already closed.")
        
    try:
        db_job.is_closed = True
        
        # reject all pending applications
        pending_apps = db.query(Application).filter(
            Application.job_id == job_id, 
            Application.status == "pending"
        ).all()
        
        for app in pending_apps:
            app.status = "rejected"
            note = "This position has been closed by the hiring manager."
            history = StatusHistory(
                application_id=app.id,
                from_status="pending",
                to_status="rejected",
                note=note
            )
            db.add(history)
            
        db.commit()
        db.refresh(db_job)
        return db_job
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to close job")

@router.post("/jobs/{job_id}/apply", response_model=ApplicationResponse, status_code=201)
def apply_to_job(job_id: int, application: ApplicationCreate, db: Session = Depends(get_db)):
    db_job = db.query(Job).filter(Job.id == job_id).first()
    
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    if db_job.is_closed:
        raise HTTPException(status_code=422, detail="This position has been closed.")
    if db_job.deadline < date.today():
        raise HTTPException(status_code=422, detail="The application deadline has passed.")
        
    # Check max applicants
    if db_job.max_applicants is not None:
        app_count = db.query(func.count(Application.id)).filter(Application.job_id == job_id).scalar()
        if app_count >= db_job.max_applicants:
            raise HTTPException(status_code=422, detail="This position is no longer accepting applications.")
            
    # Check duplicates
    existing_app = db.query(Application).filter(
        Application.job_id == job_id,
        func.lower(Application.email) == application.email.lower()
    ).first()
    if existing_app:
        raise HTTPException(status_code=409, detail="You have already applied to this position.")
        
    try:
        new_app = Application(
            job_id=job_id,
            status="pending",
            **application.model_dump()
        )
        db.add(new_app)
        db.flush() # flush to get new_app.id
        
        history = StatusHistory(
            application_id=new_app.id,
            from_status=None,
            to_status="pending",
            note="Application received."
        )
        db.add(history)
        
        db.commit()
        db.refresh(new_app)
        return new_app
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to submit application")

@router.get("/jobs/{job_id}/applications", response_model=list[ApplicationResponse])
def get_job_applications(job_id: int, status: Optional[str] = None, db: Session = Depends(get_db)):
    db_job = db.query(Job).filter(Job.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    query = db.query(Application).filter(Application.job_id == job_id)
    if status:
        query = query.filter(Application.status == status)
        
    results = query.order_by(Application.created_at.desc()).all()
    return results
