"""
SQLAlchemy ORM models for JobBoard Pro.
Tables: jobs, applications, application_history
"""

import json
from datetime import datetime, date

from sqlalchemy import (
    Column, Integer, String, Text, Date, DateTime,
    ForeignKey, UniqueConstraint, event,
)
from sqlalchemy.orm import relationship

from database import Base


class Job(Base):
    """A job listing posted by a hiring manager."""

    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    department = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(10), nullable=False)  # remote | hybrid | onsite
    salary_min = Column(Integer, nullable=False)
    salary_max = Column(Integer, nullable=False)
    required_skills = Column(Text, nullable=False)  # JSON-encoded list
    max_applicants = Column(Integer, nullable=True)
    deadline = Column(Date, nullable=False)
    status = Column(String(10), nullable=False, default="open")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")

    # ── helpers ──

    def get_skills(self) -> list[str]:
        """Return required_skills as a Python list."""
        try:
            return json.loads(self.required_skills)
        except (json.JSONDecodeError, TypeError):
            return []

    def set_skills(self, skills: list[str]):
        """Store a Python list as JSON text."""
        self.required_skills = json.dumps(skills)

    @property
    def is_expired(self) -> bool:
        return date.today() > self.deadline

    @property
    def is_open(self) -> bool:
        return self.status == "open"


class Application(Base):
    """An applicant's submission to a specific job."""

    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    applicant_name = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False)
    years_experience = Column(Integer, nullable=False)
    cv_summary = Column(Text, nullable=False)
    linkedin_url = Column(String(500), nullable=True)
    status = Column(String(20), nullable=False, default="pending")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Constraints — one application per email per job
    __table_args__ = (
        UniqueConstraint("job_id", "email", name="uq_job_email"),
    )

    # Relationships
    job = relationship("Job", back_populates="applications")
    history = relationship("ApplicationHistory", back_populates="application", cascade="all, delete-orphan")


class ApplicationHistory(Base):
    """Audit log entry for every status change on an application."""

    __tablename__ = "application_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    old_status = Column(String(20), nullable=True)   # null on first creation
    new_status = Column(String(20), nullable=False)
    note = Column(Text, nullable=False)
    changed_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    application = relationship("Application", back_populates="history")
