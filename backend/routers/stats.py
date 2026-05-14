from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Application, Job
from ..schemas import StatsResponse

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    today = date.today()

    total_jobs = db.query(Job).count()
    open_jobs = db.query(Job).filter(
        Job.is_closed == False, Job.deadline >= today
    ).count()
    closed_jobs = db.query(Job).filter(
        (Job.is_closed == True) | (Job.deadline < today)
    ).count()
    total_applications = db.query(Application).count()

    avg_apps = 0.0
    if total_jobs > 0:
        avg_apps = round(total_applications / total_jobs, 2)

    # Top department: department with most open jobs
    top_dept_row = (
        db.query(Job.department, func.count(Job.id).label("cnt"))
        .filter(Job.is_closed == False, Job.deadline >= today)
        .group_by(Job.department)
        .order_by(func.count(Job.id).desc())
        .first()
    )
    top_department: Optional[str] = top_dept_row[0] if top_dept_row else None

    return {
        "total_jobs": total_jobs,
        "open_jobs": open_jobs,
        "closed_jobs": closed_jobs,
        "total_applications": total_applications,
        "avg_applications_per_job": avg_apps,
        "top_department": top_department,
    }
