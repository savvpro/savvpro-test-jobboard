from sqlalchemy import Column, Integer, String, Boolean, Date,DateTime, Enum as SQLAlchemyEnum, JSON, ForeignKey, UniqueConstraint
import enum
from .database import Base
import datetime

class LocationEnum(str, enum.Enum):
    remote = "remote"
    hybrid = "hybrid"
    onsite = "onsite"

class JobListing(Base):
    __tablename__ = "job_listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    department = Column(String, index=True, nullable=False)
    description = Column(String, nullable=False)
    location = Column(SQLAlchemyEnum(LocationEnum), nullable=False)
    salary_min = Column(Integer, nullable=False)
    salary_max = Column(Integer, nullable=False)
    required_skills = Column(JSON, nullable=False) # Stored as JSON/Text in SQLite
    max_applicants = Column(Integer, nullable=True)
    deadline = Column(Date, nullable=False)
    is_closed = Column(Boolean, default=False)

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("job_listings.id"), nullable=False)
    applicant_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    years_experience = Column(Integer, nullable=False)
    cv_summary = Column(String, nullable=False)
    linkedin_url = Column(String, nullable=True)
    status = Column(String, default="pending", nullable=False)

    # Enforce the unique constraint: one email per job
    __table_args__ = (
        UniqueConstraint("job_id", "email", name="uq_job_email"),
    )

class ApplicationHistory(Base):
    __tablename__ = "application_history"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    previous_status = Column(String, nullable=False)
    new_status = Column(String, nullable=False)
    manager_note = Column(String, nullable=False)
    changed_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.UTC), nullable=False)