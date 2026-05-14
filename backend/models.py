from sqlalchemy import Column, Integer, String, Text, Boolean, Date, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    department = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String, nullable=False)  # remote / hybrid / onsite
    salary_min = Column(Integer, nullable=False)
    salary_max = Column(Integer, nullable=False)
    required_skills = Column(JSON, nullable=False)
    max_applicants = Column(Integer, nullable=True)
    deadline = Column(Date, nullable=False)
    is_closed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    applicant_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    years_experience = Column(Integer, nullable=False)
    cv_summary = Column(Text, nullable=False)
    linkedin_url = Column(String, nullable=True)
    status = Column(String, nullable=False, default="pending")  # pending / shortlisted / offered / rejected
    created_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("Job", back_populates="applications")
    status_history = relationship("StatusHistory", back_populates="application", cascade="all, delete-orphan", lazy="joined")


class StatusHistory(Base):
    __tablename__ = "status_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    from_status = Column(String, nullable=True)
    to_status = Column(String, nullable=False)
    note = Column(Text, nullable=False)
    changed_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="status_history")
