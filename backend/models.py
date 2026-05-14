import json
from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    department = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String, nullable=False)  # remote | hybrid | onsite
    salary_min = Column(Integer, nullable=False)
    salary_max = Column(Integer, nullable=False)
    _required_skills = Column("required_skills", Text, nullable=False)
    max_applicants = Column(Integer, nullable=True)
    deadline = Column(Date, nullable=False)
    is_closed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")

    @property
    def required_skills(self) -> list[str]:
        return json.loads(self._required_skills)

    @required_skills.setter
    def required_skills(self, value: list[str]):
        self._required_skills = json.dumps(value)


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    applicant_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    years_experience = Column(Integer, nullable=False)
    cv_summary = Column(Text, nullable=False)
    linkedin_url = Column(String, nullable=True)
    current_status = Column(String, default="pending", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    job = relationship("Job", back_populates="applications")
    status_history = relationship(
        "StatusHistory",
        back_populates="application",
        cascade="all, delete-orphan",
        order_by="StatusHistory.created_at",
    )


class StatusHistory(Base):
    __tablename__ = "status_history"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    status = Column(String, nullable=False)
    note = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    application = relationship("Application", back_populates="status_history")
