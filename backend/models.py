import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from .database import Base


class LocationEnum(str, enum.Enum):
    remote = "remote"
    hybrid = "hybrid"
    onsite = "onsite"


class StatusEnum(str, enum.Enum):
    pending = "pending"
    shortlisted = "shortlisted"
    offered = "offered"
    rejected = "rejected"


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    department = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    location = Column(Enum(LocationEnum), nullable=False)
    salary_min = Column(Integer, nullable=False)
    salary_max = Column(Integer, nullable=False)
    required_skills = Column(Text, nullable=False)  # JSON string
    max_applicants = Column(Integer, nullable=True)
    deadline = Column(Date, nullable=False)
    is_closed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    applications = relationship("Application", back_populates="job")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    applicant_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    years_experience = Column(Integer, nullable=False)
    cv_summary = Column(Text, nullable=False)
    linkedin_url = Column(String, nullable=True)
    current_status = Column(Enum(StatusEnum), default=StatusEnum.pending, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    job = relationship("Job", back_populates="applications")
    status_history = relationship(
        "StatusHistory", back_populates="application", order_by="StatusHistory.changed_at"
    )

    __table_args__ = (UniqueConstraint("job_id", "email", name="uq_job_applicant"),)


class StatusHistory(Base):
    __tablename__ = "status_history"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    from_status = Column(Enum(StatusEnum), nullable=True)
    to_status = Column(Enum(StatusEnum), nullable=False)
    note = Column(Text, nullable=False)
    changed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    application = relationship("Application", back_populates="status_history")
