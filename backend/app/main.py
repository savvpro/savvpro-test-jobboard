from fastapi import FastAPI, Depends, HTTPException, Query
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from . import models, schemas, crud
from .database import engine, get_db
from datetime import date
# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="JobBoard Pro API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Allow your Next.js app
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods (GET, POST, PATCH, etc.)
    allow_headers=["*"],
)

@app.post("/api/jobs", response_model=schemas.JobListingResponse, status_code=201)
def create_job(job: schemas.JobListingCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_job_listing(db=db, job=job)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.get("/api/jobs", response_model=schemas.PaginatedJobListingResponse)
def read_jobs(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    department: Optional[str] = None,
    location: Optional[schemas.LocationEnum] = None,
    skill: Optional[str] = None,
    include_closed: bool = False,
    db: Session = Depends(get_db)
):
    return crud.get_jobs(
        db=db,
        page=page,
        per_page=per_page,
        department=department,
        location=location.value if location else None,
        skill=skill,
        include_closed=include_closed
    )

@app.post("/api/jobs/{id}/apply", response_model=schemas.ApplicationResponse, status_code=201)
def apply_for_job(id: int, application: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    job = crud.get_job(db, id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Business Rule 1 & 2: Cannot apply if closed or past deadline
    if job.is_closed:
        raise HTTPException(status_code=400, detail="Cannot apply to a closed job")
    if job.deadline < date.today():
        raise HTTPException(status_code=400, detail="Cannot apply after the deadline")

    # Business Rule 3: Enforce unique email per job
    if crud.get_application_by_email(db, id, application.email):
        raise HTTPException(status_code=400, detail="You have already applied for this job")

    # Business Rule 4: Max applicants cap
    if job.max_applicants is not None:
        current_count = crud.count_applications_for_job(db, id)
        if current_count >= job.max_applicants:
            raise HTTPException(status_code=400, detail="Application cap reached for this job")

    try:
        return crud.create_application(db=db, job_id=id, application=application)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.get("/api/jobs/{id}/applications", response_model=List[schemas.ApplicationResponse])
def get_job_applications(id: int, status: Optional[str] = None, db: Session = Depends(get_db)):
    # Verify job exists first
    job = crud.get_job(db, id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    return crud.get_applications_by_job(db, job_id=id, status_filter=status)

@app.patch("/api/applications/{id}/status", response_model=schemas.ApplicationResponse)
def update_status(id: int, update_data: schemas.ApplicationStatusUpdate, db: Session = Depends(get_db)):
    try:
        return crud.update_application_status(
            db=db, 
            application_id=id, 
            new_status=update_data.status, 
            note=update_data.note
        )
    except ValueError as e:
        # Catch our custom transition rules errors and return a 400
        raise HTTPException(status_code=400, detail=str(e))
    
@app.get("/api/stats", response_model=schemas.JobStats)
def read_stats(db: Session = Depends(get_db)):
    return crud.get_stats(db)

@app.patch("/api/jobs/{id}/close", response_model=schemas.JobListingResponse)
def close_job_endpoint(id: int, db: Session = Depends(get_db)):
    try:
        return crud.close_job(db=db, job_id=id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))