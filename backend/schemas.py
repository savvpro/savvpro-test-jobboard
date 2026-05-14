from pydantic import BaseModel, EmailStr, model_validator, field_validator, Field, RootModel
from typing import Optional, List
from datetime import date, datetime
from enum import Enum

class LocationEnum(str, Enum):
    remote = "remote"
    hybrid = "hybrid"
    onsite = "onsite"

class StatusEnum(str, Enum):
    pending = "pending"
    shortlisted = "shortlisted"
    offered = "offered"
    rejected = "rejected"

class JobCreate(BaseModel):
    title: str
    department: str
    description: str
    location: LocationEnum
    salary_min: int
    salary_max: int
    required_skills: List[str] = Field(min_length=1)
    max_applicants: Optional[int] = None
    deadline: date

    @model_validator(mode="after")
    def check_salary(self):
        if self.salary_min >= self.salary_max:
            raise ValueError('salary_min must be strictly less than salary_max')
        return self

class JobResponse(JobCreate):
    id: int
    is_closed: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class JobListResponse(BaseModel):
    total_count: int
    page: int
    per_page: int
    results: List[JobResponse]

class ApplicationCreate(BaseModel):
    applicant_name: str
    email: EmailStr
    years_experience: int = Field(ge=0)
    cv_summary: str = Field(max_length=1000)
    linkedin_url: Optional[str] = None

    @field_validator("linkedin_url")
    def check_linkedin(cls, v):
        if v is not None:
            if not (v.startswith("https://linkedin.com/") or v.startswith("https://www.linkedin.com/")):
                raise ValueError('linkedin_url must start with https://linkedin.com/ or https://www.linkedin.com/')
        return v

class StatusHistoryResponse(BaseModel):
    id: int
    from_status: Optional[str] = None
    to_status: str
    note: str
    changed_at: datetime
    
    class Config:
        from_attributes = True

class ApplicationResponse(ApplicationCreate):
    id: int
    job_id: int
    status: StatusEnum
    created_at: datetime
    status_history: List[StatusHistoryResponse] = []
    
    class Config:
        from_attributes = True

class ApplicationListResponse(RootModel):
    root: List[ApplicationResponse]

class StatusUpdateRequest(BaseModel):
    status: StatusEnum
    note: str = Field(min_length=1)


class StatsResponse(BaseModel):
    total_jobs: int
    open_jobs: int
    closed_jobs: int
    total_applications: int
    avg_applications_per_job: float
    top_department: Optional[str]
