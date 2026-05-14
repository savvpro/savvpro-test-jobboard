import sys
import os
import datetime
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from app.main import app
from app.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def future_date(days=30):
    return (datetime.date.today() + datetime.timedelta(days=days)).isoformat()

# Setup a job for the applications tests
@pytest.fixture(scope="module", autouse=True)
def setup_job():
    client.post(
        "/api/jobs",
        json={
            "title": "Frontend Dev",
            "department": "Engineering",
            "description": "React builder.",
            "location": "remote",
            "salary_min": 80000,
            "salary_max": 100000,
            "required_skills": ["React", "Next.js"],
            "max_applicants": 2, # Setting a low cap for testing
            "deadline": future_date()
        },
    )

def test_successful_application():
    response = client.post(
        "/api/jobs/1/apply",
        json={
            "applicant_name": "Alice Smith",
            "email": "alice@example.com",
            "years_experience": 4,
            "cv_summary": "Great frontend developer.",
            "linkedin_url": "https://linkedin.com/in/alicesmith"
        }
    )
    assert response.status_code == 201
    assert response.json()["status"] == "pending"
    assert response.json()["applicant_name"] == "Alice Smith"

def test_duplicate_application_rejection():
    # Attempting to apply again with the exact same email
    response = client.post(
        "/api/jobs/1/apply",
        json={
            "applicant_name": "Alice S.",
            "email": "alice@example.com",
            "years_experience": 5,
            "cv_summary": "Updated CV."
        }
    )
    assert response.status_code == 400
    assert "already applied" in response.json()["detail"]

def test_max_applicants_rejection():
    # Fill the second and final slot
    client.post(
        "/api/jobs/1/apply",
        json={
            "applicant_name": "Bob Jones",
            "email": "bob@example.com",
            "years_experience": 2,
            "cv_summary": "Junior dev."
        }
    )
    
    # Try to add a 3rd applicant (cap is 2)
    response = client.post(
        "/api/jobs/1/apply",
        json={
            "applicant_name": "Charlie Brown",
            "email": "charlie@example.com",
            "years_experience": 1,
            "cv_summary": "Let me in!"
        }
    )
    assert response.status_code == 400
    assert "Application cap reached" in response.json()["detail"]

def test_invalid_linkedin_url():
    response = client.post(
        "/api/jobs/1/apply",
        json={
            "applicant_name": "Dave",
            "email": "dave@example.com",
            "years_experience": 1,
            "cv_summary": "Test",
            "linkedin_url": "https://github.com/dave" # Invalid URL prefix
        }
    )
    assert response.status_code == 422 # Pydantic validation error