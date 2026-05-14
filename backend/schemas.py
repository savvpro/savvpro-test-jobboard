from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator, model_validator
import re


class JobCreate(BaseModel):
    title: str
    department: str
    description: str
    location: str
    salary_min: int
    salary_max: int
    required_skills: list[str]
    max_applicants: Optional[int] = None
    deadline: date

    @model_validator(mode="after")
    def validate_salary(self):
        if self.salary_min >= self.salary_max:
            raise ValueError("salary_min must be strictly less than salary_max")
        return self

    @field_validator("deadline")
    @classmethod
    def deadline_must_be_future(cls, v: date) -> date:
        if v <= date.today():
            raise ValueError("deadline must be a future date")
        return v

    @field_validator("location")
    @classmethod
    def validate_location(cls, v: str) -> str:
        if v not in ("remote", "hybrid", "onsite"):
            raise ValueError("location must be one of: remote, hybrid, onsite")
        return v

    @field_validator("required_skills")
    @classmethod
    def skills_not_empty(cls, v: list[str]) -> list[str]:
        if not v:
            raise ValueError("required_skills must contain at least one skill")
        return v


class JobResponse(BaseModel):
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
    is_closed: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class JobListResponse(BaseModel):
    total_count: int
    page: int
    per_page: int
    results: list[JobResponse]


class ApplicationCreate(BaseModel):
    applicant_name: str
    email: EmailStr
    years_experience: int
    cv_summary: str
    linkedin_url: Optional[str] = None

    @field_validator("years_experience")
    @classmethod
    def experience_non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("years_experience must be >= 0")
        return v

    @field_validator("cv_summary")
    @classmethod
    def cv_max_length(cls, v: str) -> str:
        if len(v) > 1000:
            raise ValueError("cv_summary must not exceed 1000 characters")
        return v

    @field_validator("linkedin_url")
    @classmethod
    def validate_linkedin(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not (v.startswith("https://linkedin.com/") or v.startswith("https://www.linkedin.com/")):
            raise ValueError("linkedin_url must start with https://linkedin.com/ or https://www.linkedin.com/")
        return v


class StatusHistoryEntry(BaseModel):
    id: int
    status: str
    note: str
    created_at: datetime

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
    status_history: list[StatusHistoryEntry]

    model_config = {"from_attributes": True}


class StatusUpdateRequest(BaseModel):
    status: str
    note: str

    @field_validator("note")
    @classmethod
    def note_required(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("note is required")
        return v


class StatsResponse(BaseModel):
    total_jobs: int
    open_jobs: int
    closed_jobs: int
    total_applications: int
    avg_applications_per_job: float
    top_department: Optional[str]
