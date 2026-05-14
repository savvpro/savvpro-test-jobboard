"""
Test configuration: isolated in-memory SQLite database per test session.
Each test function gets a fresh database — no state bleeds between tests.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import sys
import os

# Use in-memory SQLite for tests — NEVER touch the real jobboard.db
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Import AFTER defining the test engine
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database import Base, get_db
import models
from main import app

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(autouse=True)
def setup_database():
    """Create all tables before each test, drop after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    """FastAPI test client with DB override applied."""
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

# ─── Shared test data factories ───────────────────────────────────────────────

def make_job_payload(**overrides) -> dict:
    """Return a valid job creation payload. Override any field."""
    base = {
        "title": "Backend Engineer",
        "department": "Engineering",
        "description": "Build and maintain our FastAPI services.",
        "location": "remote",
        "salary_min": 70000,
        "salary_max": 110000,
        "required_skills": ["Python", "FastAPI", "SQL"],
        "deadline": "2099-12-31",  # Far future — won't expire during tests
    }
    base.update(overrides)
    return base

def make_application_payload(**overrides) -> dict:
    """Return a valid application payload. Override any field."""
    base = {
        "applicant_name": "Jane Smith",
        "email": "jane@example.com",
        "years_experience": 4,
        "cv_summary": "Experienced full-stack developer with a focus on backend systems.",
    }
    base.update(overrides)
    return base
