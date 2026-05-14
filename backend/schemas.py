from pydantic import BaseModel, EmailStr, Field, field_validator, HttpUrl, ConfigDict
from typing import List, Optional
from datetime import datetime, date
from models import LocationType, ApplicationStatus

class JobBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    title: str
    department: str
    description: str
    location: LocationType
    salary_min: int
    salary_max: int
    required_skills: List[str]
    max_applicants: Optional[int] = None
    deadline: date

    @field_validator('salary_max')
    @classmethod
    def salary_check(cls, v: int, info) -> int:
        if 'salary_min' in info.data and v <= info.data['salary_min']:
            raise ValueError('salary_max must be strictly greater than salary_min')
        return v

    @field_validator('required_skills')
    @classmethod
    def skills_check(cls, v: List[str]) -> List[str]:
        if not v or len(v) == 0:
            raise ValueError('at least one skill is required')
        return v

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    is_closed: bool
    created_at: datetime
    application_count: int = 0

class ApplicationBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    applicant_name: str
    email: EmailStr
    years_experience: int = Field(..., ge=0)
    cv_summary: str = Field(..., max_length=1000)
    linkedin_url: Optional[str] = None

    @field_validator('linkedin_url')
    @classmethod
    def linkedin_check(cls, v: Optional[str]) -> Optional[str]:
        if v and not (v.startswith('https://linkedin.com/') or v.startswith('https://www.linkedin.com/')):
            raise ValueError('LinkedIn URL must start with https://linkedin.com/ or https://www.linkedin.com/')
        return v

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationResponse(ApplicationBase):
    id: int
    job_id: int
    status: ApplicationStatus
    applied_at: datetime

class StatusUpdate(BaseModel):
    new_status: ApplicationStatus
    note: str

class ApplicationHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    from_status: ApplicationStatus
    to_status: ApplicationStatus
    note: str
    timestamp: datetime

class ApplicationDetailResponse(ApplicationResponse):
    history: List[ApplicationHistoryResponse]

class StatsResponse(BaseModel):
    total_jobs: int
    open_jobs: int
    closed_jobs: int
    total_applications: int
    avg_applications_per_job: float
    top_department: str
