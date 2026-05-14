"""
Pydantic schemas for request/response validation — JobBoard Pro.
"""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator, model_validator
import re


# ──────────────────────────────────────────
# Job schemas
# ──────────────────────────────────────────

class JobCreate(BaseModel):
    """Schema for creating a new job listing."""

    title: str = Field(..., min_length=1, max_length=200)
    department: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1)
    location: str = Field(...)
    salary_min: int = Field(..., ge=0)
    salary_max: int = Field(..., ge=0)
    required_skills: list[str] = Field(..., min_length=1)
    max_applicants: Optional[int] = Field(None, ge=1)
    deadline: date

    @field_validator("location")
    @classmethod
    def validate_location(cls, v: str) -> str:
        allowed = {"remote", "hybrid", "onsite"}
        if v.lower() not in allowed:
            raise ValueError(f"location must be one of: {', '.join(sorted(allowed))}")
        return v.lower()

    @model_validator(mode="after")
    def salary_range_check(self):
        if self.salary_min >= self.salary_max:
            raise ValueError("salary_min must be strictly less than salary_max")
        return self

    @field_validator("required_skills")
    @classmethod
    def validate_skills(cls, v: list[str]) -> list[str]:
        cleaned = [s.strip() for s in v if s.strip()]
        if not cleaned:
            raise ValueError("At least one non-empty skill is required")
        return cleaned

    @field_validator("deadline")
    @classmethod
    def validate_deadline(cls, v: date) -> date:
        if v < date.today():
            raise ValueError("Deadline must be today or in the future")
        return v


class JobResponse(BaseModel):
    """Schema for returning a job listing."""

    id: int
    title: str
    department: str
    description: str
    location: str
    salary_min: int
    salary_max: int
    required_skills: list[str]
    max_applicants: Optional[int]
    deadline: date
    status: str
    created_at: datetime
    application_count: int = 0

    model_config = {"from_attributes": True}


class JobListResponse(BaseModel):
    """Paginated list of jobs."""

    total_count: int
    page: int
    per_page: int
    results: list[JobResponse]


# ──────────────────────────────────────────
# Application schemas
# ──────────────────────────────────────────

class ApplicationCreate(BaseModel):
    """Schema for submitting a job application."""

    applicant_name: str = Field(..., min_length=1, max_length=200)
    email: str = Field(..., min_length=1)
    years_experience: int = Field(..., ge=0)
    cv_summary: str = Field(..., min_length=1, max_length=1000)
    linkedin_url: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(pattern, v):
            raise ValueError("Invalid email format")
        return v.lower().strip()

    @field_validator("linkedin_url")
    @classmethod
    def validate_linkedin(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v.strip() == "":
            return None
        if not (v.startswith("https://linkedin.com/") or v.startswith("https://www.linkedin.com/")):
            raise ValueError(
                "LinkedIn URL must begin with https://linkedin.com/ or https://www.linkedin.com/"
            )
        return v


class ApplicationResponse(BaseModel):
    """Schema for returning an application."""

    id: int
    job_id: int
    applicant_name: str
    email: str
    years_experience: int
    cv_summary: str
    linkedin_url: Optional[str]
    status: str
    created_at: datetime
    history: list["HistoryEntry"] = []

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────
# Status update schemas
# ──────────────────────────────────────────

class StatusUpdate(BaseModel):
    """Schema for updating an application's status."""

    status: str
    note: str = Field(..., min_length=1)

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"pending", "shortlisted", "offered", "rejected"}
        if v.lower() not in allowed:
            raise ValueError(f"status must be one of: {', '.join(sorted(allowed))}")
        return v.lower()


class HistoryEntry(BaseModel):
    """A single status change event."""

    id: int
    old_status: Optional[str]
    new_status: str
    note: str
    changed_at: datetime

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────
# Stats schema
# ──────────────────────────────────────────

class ActivityItem(BaseModel):
    icon: str
    title: str
    description: str
    time_str: str
    color: str

class StatsResponse(BaseModel):
    """Analytics / statistics response."""

    total_jobs: int
    open_jobs: int
    closed_jobs: int
    total_applications: int
    avg_applications_per_job: float
    top_department: Optional[str]
    application_trends: list[int] = []
    recent_activity: list[ActivityItem] = []


# Rebuild forward refs
ApplicationResponse.model_rebuild()
