from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum
from datetime import datetime

Base = declarative_base()

class LocationType(str, enum.Enum):
    remote = "remote"
    hybrid = "hybrid"
    onsite = "onsite"

class ApplicationStatus(str, enum.Enum):
    pending = "pending"
    shortlisted = "shortlisted"
    offered = "offered"
    rejected = "rejected"

class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    department = Column(String, nullable=False)
    description = Column(String, nullable=False)
    location = Column(Enum(LocationType), nullable=False)
    salary_min = Column(Integer, nullable=False)
    salary_max = Column(Integer, nullable=False)
    required_skills = Column(JSON, nullable=False)
    max_applicants = Column(Integer, nullable=True)
    deadline = Column(DateTime, nullable=False)
    is_closed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    applications = relationship("Application", back_populates="job")

class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    applicant_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    years_experience = Column(Integer, nullable=False)
    cv_summary = Column(String(1000), nullable=False)
    linkedin_url = Column(String, nullable=True)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.pending)
    applied_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("Job", back_populates="applications")
    history = relationship("ApplicationHistory", back_populates="application")

class ApplicationHistory(Base):
    __tablename__ = "application_history"
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    from_status = Column(Enum(ApplicationStatus), nullable=False)
    to_status = Column(Enum(ApplicationStatus), nullable=False)
    note = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="history")
