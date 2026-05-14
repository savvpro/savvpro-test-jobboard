"""
Applications Router - Handles updating application statuses.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Application, StatusHistory
from schemas import ApplicationResponse, StatusUpdateRequest

router = APIRouter(tags=["applications"])

VALID_TRANSITIONS = {
    "pending":     ["shortlisted", "rejected"],
    "shortlisted": ["offered", "rejected"],
    "offered":     ["rejected"],
    "rejected":    [],  # terminal state
}

@router.patch("/applications/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: int,
    update: StatusUpdateRequest,
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    current_status = app.status
    new_status = update.status.value
    
    if new_status == current_status:
        raise HTTPException(status_code=400, detail="Application is already in this status.")
        
    if new_status not in VALID_TRANSITIONS.get(current_status, []):
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot transition from '{current_status}' to '{new_status}'."
        )
        
    try:
        app.status = new_status
        history_entry = StatusHistory(
            application_id=app.id,
            from_status=current_status,
            to_status=new_status,
            note=update.note
        )
        db.add(history_entry)
        db.commit()
        db.refresh(app)
        return app
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update application status")
