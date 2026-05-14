# ARCHITECTURE.md

## 1. Overview

This document describes the architecture of the **Job Board / Recruitment System**.  
It uses **SQLAlchemy** (PostgreSQL recommended) with **FastAPI** as the backend.

**Core Entities**:
- `Job` — Open positions
- `Application` — Candidate submissions
- `ApplicationStatusHistory` — Full audit trail of status changes

**Design Principles**:
- Full auditability via status history
- Soft deletes on all major tables
- Strong data integrity constraints
- Clear resolution of business ambiguities

---

## 2. Data Model

### Enums

```python
class LocationEnum(str, enum.Enum):
    remote = "remote"
    hybrid = "hybrid"
    onsite = "onsite"

class ApplicationStatusEnum(str, enum.Enum):
    pending = "pending"
    shortlisted = "shortlisted"
    offered = "offered"
    rejected = "rejected"

Mixins

class TimestampMixin:
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class SoftDeleteMixin:
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime, nullable=True)

Job Table

class Job(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    department = Column(String, nullable=False)
    description = Column(String, nullable=False)
    location = Column(Enum(LocationEnum, native_enum=False), nullable=False)
    salary_min = Column(Integer, nullable=False)
    salary_max = Column(Integer, nullable=False)
    required_skills = Column(JSON, nullable=False)          # e.g. ["Python", "Django"]
    max_applicants = Column(Integer, nullable=True)         # null = unlimited
    deadline = Column(Date, nullable=False)
    is_closed = Column(Boolean, default=False, nullable=False)

    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint('salary_min < salary_max', name='check_salary_range'),
    )

Application Table

class Application(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    applicant_name = Column(String, nullable=False)
    email = Column(String, index=True, nullable=False)
    years_experience = Column(Integer, nullable=False)
    cv_summary = Column(String(1000), nullable=False)
    linkedin_url = Column(String, nullable=True)
    status = Column(Enum(ApplicationStatusEnum, native_enum=False),
                   default=ApplicationStatusEnum.pending, nullable=False)

    job = relationship("Job", back_populates="applications")
    status_history = relationship("ApplicationStatusHistory",
                                 back_populates="application",
                                 cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint('years_experience >= 0', name='check_years_experience_positive'),
        UniqueConstraint('job_id', 'email', name='uix_job_email'),
    )

ApplicationStatusHistory Table (Audit Trail)

class ApplicationStatusHistory(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "application_status_history"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    
    previous_status = Column(Enum(ApplicationStatusEnum, native_enum=False), nullable=True)
    new_status = Column(Enum(ApplicationStatusEnum, native_enum=False), nullable=False)
    note = Column(String, nullable=False)                    # Reason for change
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    application = relationship("Application", back_populates="status_history")

3. Ambiguities Resolved

#,Ambiguity,Resolution
1,Can same candidate apply multiple times to same job?,"No – Enforced with UniqueConstraint('job_id', 'email')"
2,Should status changes be tracked?,Yes – Full immutable audit trail in ApplicationStatusHistory
3,"When to enforce max_applicants, deadline, is_closed?",Enforced at application creation time in service layer

4. API Design (FastAPI)
Base URL: /api/v1
Job Endpoints

GET    /jobs – List jobs (with filters)
GET    /jobs/{job_id} – Get job detail
POST   /jobs – Create new job
PUT    /jobs/{job_id} – Update job
DELETE /jobs/{job_id} – Soft delete job
PATCH  /jobs/{job_id}/close – Manually close job

Application Endpoints

POST   /applications – Submit new application
GET    /jobs/{job_id}/applications – List applications for a job
GET    /applications/{app_id} – Get application + full status history
PATCH  /applications/{app_id}/status – Update status (new_status + note)


5. Business Rules

Every status change must create a record in ApplicationStatusHistory
Applications can only be submitted if job is open, not past deadline, and under max_applicants limit
Soft delete is applied on all major entities
Strong database constraints for data integrity


Status: Complete & Production-ready
Last Updated: May 2026