from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from schemas import ApplicationCreate, ApplicationResponse, StatusUpdateRequest
from services import application_service

router = APIRouter(prefix="/api", tags=["applications"])


@router.post(
    "/jobs/{job_id}/applications",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_application(job_id: int, data: ApplicationCreate, db: Session = Depends(get_db)):
    return application_service.submit_application(db, job_id, data)


@router.get("/jobs/{job_id}/applications", response_model=list[ApplicationResponse])
def list_applications(
    job_id: int,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return application_service.list_applications(db, job_id, status)


@router.get("/applications/{application_id}", response_model=ApplicationResponse)
def get_application(application_id: int, db: Session = Depends(get_db)):
    return application_service.get_application(db, application_id)


@router.patch("/applications/{application_id}/status", response_model=ApplicationResponse)
def update_status(
    application_id: int,
    data: StatusUpdateRequest,
    db: Session = Depends(get_db),
):
    return application_service.update_status(db, application_id, data)
