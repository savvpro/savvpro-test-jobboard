from pydantic import BaseModel, model_validator, ConfigDict, Field, field_validator
from typing import List, Optional
from datetime import date, datetime
from enum import Enum

class LocationEnum(str, Enum):
    remote = "remote"
    hybrid = "hybrid"
    onsite = "onsite"

class JobListingBase(BaseModel):
    title: str
    department: str
    description: str
    location: LocationEnum
    salary_min: int
    salary_max: int
    required_skills: List[str]
    max_applicants: Optional[int] = None
    deadline: date
    is_closed: bool = False

    @model_validator(mode='after')
    def check_salary(self) -> 'JobListingBase':
        if self.salary_min >= self.salary_max:
            raise ValueError('salary_min must be strictly less than salary_max')
        return self

class JobListingCreate(JobListingBase):
    pass

class JobListingResponse(JobListingBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class PaginatedJobListingResponse(BaseModel):
    total_count: int
    page: int
    per_page: int
    results: List[JobListingResponse]
    
    model_config = ConfigDict(from_attributes=True)

class ApplicationBase(BaseModel):
    applicant_name: str
    email: str
    years_experience: int = Field(ge=0)
    cv_summary: str = Field(max_length=1000)
    linkedin_url: Optional[str] = None

    @field_validator('linkedin_url')
    @classmethod
    def validate_linkedin(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if not (v.startswith('https://linkedin.com/') or v.startswith('https://www.linkedin.com/')):
                raise ValueError('linkedin_url must begin with https://linkedin.com/ or https://www.linkedin.com/')
        return v

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationResponse(ApplicationBase):
    id: int
    job_id: int
    status: str

    model_config = ConfigDict(from_attributes=True)

class ApplicationStatusUpdate(BaseModel):
    status: str
    note: str

class ApplicationHistoryResponse(BaseModel):
    id: int
    application_id: int
    previous_status: str
    new_status: str
    manager_note: str
    changed_at: datetime

    model_config = ConfigDict(from_attributes=True)

class JobStats(BaseModel):
    total_jobs: int
    open_jobs: int
    closed_jobs: int
    total_applications: int
    avg_applications_per_job: float
    top_department: str