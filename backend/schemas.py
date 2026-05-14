from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, field_validator, model_validator


# ─── Job Schemas ─────────────────────────────────────────────────────────────

class JobCreate(BaseModel):
    title: str
    department: str
    description: str
    location: str  # remote / hybrid / onsite
    salary_min: int
    salary_max: int
    required_skills: List[str]
    max_applicants: Optional[int] = None
    deadline: date

    @model_validator(mode="after")
    def salary_range_check(self):
        if self.salary_min >= self.salary_max:
            raise ValueError("salary_min must be strictly less than salary_max")
        return self

    @field_validator("required_skills")
    @classmethod
    def skills_non_empty(cls, v):
        if not v:
            raise ValueError("required_skills must contain at least one skill")
        return v

    @field_validator("location")
    @classmethod
    def location_valid(cls, v):
        allowed = {"remote", "hybrid", "onsite"}
        if v not in allowed:
            raise ValueError(f"location must be one of {allowed}")
        return v

    @field_validator("max_applicants")
    @classmethod
    def max_applicants_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError("max_applicants must be a positive integer")
        return v


class JobResponse(BaseModel):
    id: int
    title: str
    department: str
    description: str
    location: str
    salary_min: int
    salary_max: int
    required_skills: List[str]
    max_applicants: Optional[int]
    deadline: date
    is_closed: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class JobListResponse(BaseModel):
    total_count: int
    page: int
    per_page: int
    results: List[JobResponse]


# ─── Application Schemas ──────────────────────────────────────────────────────

class ApplicationCreate(BaseModel):
    applicant_name: str
    email: EmailStr
    years_experience: int
    cv_summary: str
    linkedin_url: Optional[str] = None

    @field_validator("years_experience")
    @classmethod
    def experience_non_negative(cls, v):
        if v < 0:
            raise ValueError("years_experience must be >= 0")
        return v

    @field_validator("cv_summary")
    @classmethod
    def cv_max_length(cls, v):
        if len(v) > 1000:
            raise ValueError("cv_summary must not exceed 1000 characters")
        return v

    @field_validator("linkedin_url")
    @classmethod
    def linkedin_valid(cls, v):
        if v is not None:
            if not (
                v.startswith("https://linkedin.com/")
                or v.startswith("https://www.linkedin.com/")
            ):
                raise ValueError(
                    "linkedin_url must start with https://linkedin.com/ or https://www.linkedin.com/"
                )
        return v


class StatusHistoryResponse(BaseModel):
    id: int
    from_status: Optional[str]
    to_status: str
    note: str
    changed_at: datetime

    model_config = {"from_attributes": True}


class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    applicant_name: str
    email: str
    years_experience: int
    cv_summary: str
    linkedin_url: Optional[str]
    current_status: str
    created_at: datetime
    status_history: List[StatusHistoryResponse] = []

    model_config = {"from_attributes": True}


# ─── Status Update ────────────────────────────────────────────────────────────

class StatusUpdate(BaseModel):
    new_status: str
    note: str

    @field_validator("note")
    @classmethod
    def note_non_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("note must be a non-empty string")
        return v.strip()

    @field_validator("new_status")
    @classmethod
    def status_valid(cls, v):
        allowed = {"pending", "shortlisted", "offered", "rejected"}
        if v not in allowed:
            raise ValueError(f"new_status must be one of {allowed}")
        return v


# ─── Stats ────────────────────────────────────────────────────────────────────

class StatsResponse(BaseModel):
    total_jobs: int
    open_jobs: int
    closed_jobs: int
    total_applications: int
    avg_applications_per_job: float
    top_department: Optional[str]
