"""
Stats Router - Handles analytics.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date

from database import get_db
from models import Job, Application
from schemas import StatsResponse

router = APIRouter(tags=["stats"])

@router.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    today = date.today()
    
    total_jobs = db.query(func.count(Job.id)).scalar() or 0
    open_jobs = db.query(func.count(Job.id)).filter(Job.is_closed == False, Job.deadline >= today).scalar() or 0
    closed_jobs = total_jobs - open_jobs
    
    total_applications = db.query(func.count(Application.id)).scalar() or 0
    avg = total_applications / total_jobs if total_jobs > 0 else 0.0

    top_dept_row = (
        db.query(Job.department, func.count(Job.id).label("cnt"))
        .group_by(Job.department)
        .order_by(func.count(Job.id).desc())
        .first()
    )
    top_department = top_dept_row[0] if top_dept_row else None
    
    return {
        "total_jobs": total_jobs,
        "open_jobs": open_jobs,
        "closed_jobs": closed_jobs,
        "total_applications": total_applications,
        "avg_applications_per_job": avg,
        "top_department": top_department
    }
