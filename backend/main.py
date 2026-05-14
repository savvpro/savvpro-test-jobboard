from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, date
import models, schemas, database
from database import get_db, init_db

app = FastAPI(title="JobBoard Pro API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()

# --- Job Endpoints ---

@app.post("/api/jobs", response_model=schemas.JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(job: schemas.JobCreate, db: Session = Depends(get_db)):
    db_job = models.Job(
        title=job.title,
        department=job.department,
        description=job.description,
        location=job.location,
        salary_min=job.salary_min,
        salary_max=job.salary_max,
        required_skills=job.required_skills,
        max_applicants=job.max_applicants,
        deadline=datetime.combine(job.deadline, datetime.min.time())
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@app.get("/api/jobs")
def list_jobs(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1),
    department: Optional[str] = None,
    location: Optional[models.LocationType] = None,
    skill: Optional[str] = None,
    include_closed: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(models.Job)
    
    if not include_closed:
        query = query.filter(models.Job.is_closed == False, models.Job.deadline >= datetime.utcnow())
    
    if department:
        query = query.filter(models.Job.department == department)
    if location:
        query = query.filter(models.Job.location == location)
    if skill:
        query = query.filter(models.Job.required_skills.contains(skill))

    total_count = query.count()
    results = query.offset((page - 1) * per_page).limit(per_page).all()
    
    for job in results:
        job.application_count = db.query(models.Application).filter(models.Application.job_id == job.id).count()

    return {
        "total_count": total_count, "page": page, "per_page": per_page, "results": results
    }

@app.get("/api/jobs/{job_id}", response_model=schemas.JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.application_count = db.query(models.Application).filter(models.Application.job_id == job_id).count()
    return job

@app.post("/api/jobs/{job_id}/close")
def close_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job.is_closed = True
    
    pending_apps = db.query(models.Application).filter(
        models.Application.job_id == job_id,
        models.Application.status == models.ApplicationStatus.pending
    ).all()
    
    for app in pending_apps:
        history = models.ApplicationHistory(
            application_id=app.id,
            from_status=app.status,
            to_status=models.ApplicationStatus.rejected,
            note="Position closed by hiring manager."
        )
        app.status = models.ApplicationStatus.rejected
        db.add(history)
        
    db.commit()
    return {"message": "Job closed and pending applications rejected"}

# --- Application Endpoints ---

@app.post("/api/jobs/{job_id}/apply", response_model=schemas.ApplicationResponse)
def apply_to_job(job_id: int, application: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.is_closed or job.deadline < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Job is closed or deadline passed")
    
    app_count = db.query(models.Application).filter(models.Application.job_id == job_id).count()
    if job.max_applicants and app_count >= job.max_applicants:
        raise HTTPException(status_code=400, detail="Max applicants reached")
    
    existing = db.query(models.Application).filter(
        models.Application.job_id == job_id,
        models.Application.email == application.email
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this job")
    
    db_application = models.Application(
        job_id=job_id,
        applicant_name=application.applicant_name,
        email=application.email,
        years_experience=application.years_experience,
        cv_summary=application.cv_summary,
        linkedin_url=application.linkedin_url
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

@app.get("/api/jobs/{job_id}/applications", response_model=List[schemas.ApplicationResponse])
def list_applications(job_id: int, status: Optional[models.ApplicationStatus] = None, db: Session = Depends(get_db)):
    query = db.query(models.Application).filter(models.Application.job_id == job_id)
    if status:
        query = query.filter(models.Application.status == status)
    return query.all()

@app.patch("/api/applications/{app_id}/status", response_model=schemas.ApplicationResponse)
def update_application_status(app_id: int, update: schemas.StatusUpdate, db: Session = Depends(get_db)):
    application = db.query(models.Application).filter(models.Application.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    old_status = application.status
    new_status = update.new_status
    
    # Workflow Rules
    valid_transitions = {
        models.ApplicationStatus.pending: [models.ApplicationStatus.shortlisted, models.ApplicationStatus.rejected],
        models.ApplicationStatus.shortlisted: [models.ApplicationStatus.offered, models.ApplicationStatus.rejected],
        models.ApplicationStatus.offered: [models.ApplicationStatus.rejected],
        models.ApplicationStatus.rejected: []
    }
    
    if new_status not in valid_transitions.get(old_status, []):
        raise HTTPException(status_code=400, detail="Invalid transition")
    
    history = models.ApplicationHistory(
        application_id=app_id, from_status=old_status, to_status=new_status, note=update.note
    )
    application.status = new_status
    db.add(history)
    db.commit()
    db.refresh(application)
    return application

@app.get("/api/applications/{app_id}", response_model=schemas.ApplicationDetailResponse)
def get_application_detail(app_id: int, db: Session = Depends(get_db)):
    application = db.query(models.Application).filter(models.Application.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application

# --- Analytics Endpoint ---

@app.get("/api/stats", response_model=schemas.StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    total_jobs = db.query(models.Job).count()
    open_jobs = db.query(models.Job).filter(models.Job.is_closed == False, models.Job.deadline >= datetime.utcnow()).count()
    closed_jobs = total_jobs - open_jobs
    total_applications = db.query(models.Application).count()
    avg_apps = total_applications / total_jobs if total_jobs > 0 else 0
    top_dept_query = db.query(models.Job.department, func.count(models.Job.id)).group_by(models.Job.department).order_by(func.count(models.Job.id).desc()).first()
    top_dept = top_dept_query[0] if top_dept_query else "N/A"
    
    return {
        "total_jobs": total_jobs, "open_jobs": open_jobs, "closed_jobs": closed_jobs,
        "total_applications": total_applications, "avg_applications_per_job": avg_apps, "top_department": top_dept
    }
