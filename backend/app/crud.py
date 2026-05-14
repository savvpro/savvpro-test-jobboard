from sqlalchemy.orm import Session
from . import models, schemas
from sqlalchemy import cast, String, func
from datetime import date
from typing import Optional
def create_job_listing(db: Session, job: schemas.JobListingCreate):
    db_job = models.JobListing(**job.model_dump())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def get_jobs(
    db: Session,
    page: int = 1,
    per_page: int = 10,
    department: Optional[str] = None,
    location: Optional[str] = None,
    skill: Optional[str] = None,
    include_closed: bool = False
):
    query = db.query(models.JobListing)

    # Filter out closed and expired listings by default
    if not include_closed:
        query = query.filter(
            models.JobListing.is_closed == False,
            models.JobListing.deadline >= date.today()
        )

    # Apply simultaneous filtering if provided
    if department:
        query = query.filter(models.JobListing.department.ilike(f"%{department}%"))
    
    if location:
        query = query.filter(models.JobListing.location == location)
        
    if skill:
        # Cast the JSON array to a string to check if the skill exists inside it
        query = query.filter(cast(models.JobListing.required_skills, String).ilike(f"%\"{skill}\"%"))

    total_count = query.count()
    offset = (page - 1) * per_page
    results = query.offset(offset).limit(per_page).all()

    return {
        "total_count": total_count,
        "page": page,
        "per_page": per_page,
        "results": results
    }

# ... (keep existing code)

def get_job(db: Session, job_id: int):
    return db.query(models.JobListing).filter(models.JobListing.id == job_id).first()

def get_application_by_email(db: Session, job_id: int, email: str):
    return db.query(models.Application).filter(
        models.Application.job_id == job_id, 
        models.Application.email == email
    ).first()

def count_applications_for_job(db: Session, job_id: int):
    return db.query(models.Application).filter(models.Application.job_id == job_id).count()

def create_application(db: Session, job_id: int, application: schemas.ApplicationCreate):
    db_app = models.Application(
        job_id=job_id,
        applicant_name=application.applicant_name,
        email=application.email,
        years_experience=application.years_experience,
        cv_summary=application.cv_summary,
        linkedin_url=application.linkedin_url,
        status="pending" # Default status
    )
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app


VALID_TRANSITIONS = {
    "pending": ["shortlisted", "rejected"],
    "shortlisted": ["offered", "rejected"],
    "offered": ["rejected"],
    "rejected": [] # Terminal state
}

def get_applications_by_job(db: Session, job_id: int, status_filter: Optional[str] = None):
    query = db.query(models.Application).filter(models.Application.job_id == job_id)
    if status_filter:
        query = query.filter(models.Application.status == status_filter)
    return query.all()

def update_application_status(db: Session, application_id: int, new_status: str, note: str):
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    
    if not app:
        raise ValueError("Application not found")
        
    if new_status not in VALID_TRANSITIONS.get(app.status, []):
        raise ValueError(f"Invalid transition from '{app.status}' to '{new_status}'")

    # Create the history log
    history_entry = models.ApplicationHistory(
        application_id=app.id,
        previous_status=app.status,
        new_status=new_status,
        manager_note=note
    )
    db.add(history_entry)

    # Update the application status
    app.status = new_status
    db.commit()
    db.refresh(app)
    
    return app

def get_stats(db: Session):
    total_jobs = db.query(models.JobListing).count()
    
    # Calculate open jobs (not manually closed AND deadline hasn't passed)
    open_jobs = db.query(models.JobListing).filter(
        models.JobListing.is_closed == False, 
        models.JobListing.deadline >= date.today()
    ).count()
    
    closed_jobs = total_jobs - open_jobs
    
    total_applications = db.query(models.Application).count()
    
    avg_apps = round(total_applications / total_jobs, 2) if total_jobs > 0 else 0.0
    
    # Get the department with the most jobs
    top_dept_row = db.query(
        models.JobListing.department, 
        func.count(models.JobListing.id).label('count')
    ).group_by(models.JobListing.department).order_by(func.count(models.JobListing.id).desc()).first()
    
    top_department = top_dept_row[0] if top_dept_row else "N/A"

    return {
        "total_jobs": total_jobs,
        "open_jobs": open_jobs,
        "closed_jobs": closed_jobs,
        "total_applications": total_applications,
        "avg_applications_per_job": avg_apps,
        "top_department": top_department
    }

def close_job(db: Session, job_id: int):
    job = get_job(db, job_id)
    if not job:
        raise ValueError("Job not found")
    if job.is_closed:
        raise ValueError("Job is already closed")

    # 1. Close the job
    job.is_closed = True

    # 2. Auto-reject all 'pending' applications for this job
    pending_apps = db.query(models.Application).filter(
        models.Application.job_id == job_id, 
        models.Application.status == "pending"
    ).all()

    for app in pending_apps:
        app.status = "rejected"
        history_entry = models.ApplicationHistory(
            application_id=app.id,
            previous_status="pending",
            new_status="rejected",
            manager_note="System auto-rejection: Job listing was manually closed."
        )
        db.add(history_entry)

    db.commit()
    db.refresh(job)
    return job