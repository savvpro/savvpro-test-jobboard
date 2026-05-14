import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app
from database import Base, get_db

from sqlalchemy.pool import StaticPool

# Test Database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

# 1. Test Job Creation and Salary Validation
def test_create_job_invalid_salary():
    response = client.post("/api/jobs", json={
        "title": "Engineer",
        "department": "Engineering",
        "description": "Desc",
        "location": "remote",
        "salary_min": 1000,
        "salary_max": 500, # Invalid: max < min
        "required_skills": ["Python"],
        "deadline": "2030-12-31"
    })
    assert response.status_code == 422
    assert "salary_max must be strictly greater than salary_min" in response.text

# 2. Test Pagination
def test_pagination():
    # Create 15 jobs
    for i in range(15):
        client.post("/api/jobs", json={
            "title": f"Job {i}",
            "department": "Eng",
            "description": "Desc",
            "location": "remote",
            "salary_min": 1000,
            "salary_max": 2000,
            "required_skills": ["Python"],
            "deadline": "2030-12-31"
        })
    
    response = client.get("/api/jobs?page=1&per_page=10")
    data = response.json()
    assert data["total_count"] == 15
    assert len(data["results"]) == 10
    
    response = client.get("/api/jobs?page=2&per_page=10")
    data = response.json()
    assert len(data["results"]) == 5

# 3. Test Application and Duplicates
def test_duplicate_application():
    # Create job
    client.post("/api/jobs", json={
        "title": "Engineer",
        "department": "Eng",
        "description": "Desc",
        "location": "remote",
        "salary_min": 1000,
        "salary_max": 2000,
        "required_skills": ["Python"],
        "deadline": "2030-12-31"
    })
    
    app_data = {
        "applicant_name": "Test User",
        "email": "test@example.com",
        "years_experience": 2,
        "cv_summary": "Summary..."
    }
    
    # First application
    client.post("/api/jobs/1/apply", json=app_data)
    
    # Duplicate application
    response = client.post("/api/jobs/1/apply", json=app_data)
    assert response.status_code == 400
    assert response.json()["detail"] == "You have already applied for this job"

# 4. Test Status Workflow (Valid)
def test_status_workflow_valid():
    client.post("/api/jobs", json={
        "title": "Engineer",
        "department": "Eng",
        "description": "Desc",
        "location": "remote",
        "salary_min": 1000,
        "salary_max": 2000,
        "required_skills": ["Python"],
        "deadline": "2030-12-31"
    })
    client.post("/api/jobs/1/apply", json={
        "applicant_name": "User", "email": "a@b.com", "years_experience": 1, "cv_summary": "S"
    })
    
    # Move to shortlisted
    response = client.patch("/api/applications/1/status", json={
        "new_status": "shortlisted", "note": "Looks good"
    })
    assert response.status_code == 200
    assert response.json()["status"] == "shortlisted"

# 5. Test Status Workflow (Invalid transition)
def test_status_workflow_invalid():
    client.post("/api/jobs", json={
        "title": "Engineer", "department": "E", "description": "D", "location": "remote",
        "salary_min": 10, "salary_max": 20, "required_skills": ["P"], "deadline": "2030-12-31"
    })
    client.post("/api/jobs/1/apply", json={
        "applicant_name": "U", "email": "a@b.com", "years_experience": 1, "cv_summary": "S"
    })
    
    # Try to jump to offered without shortlisted
    response = client.patch("/api/applications/1/status", json={
        "new_status": "offered", "note": "Jump!"
    })
    assert response.status_code == 400
    assert "Invalid transition" in response.json()["detail"]

# 6. Test Max Applicants
def test_max_applicants():
    client.post("/api/jobs", json={
        "title": "Eng", "department": "E", "description": "D", "location": "remote",
        "salary_min": 10, "salary_max": 20, "required_skills": ["P"], "deadline": "2030-12-31",
        "max_applicants": 1
    })
    
    client.post("/api/jobs/1/apply", json={
        "applicant_name": "U1", "email": "u1@b.com", "years_experience": 1, "cv_summary": "S"
    })
    
    response = client.post("/api/jobs/1/apply", json={
        "applicant_name": "U2", "email": "u2@b.com", "years_experience": 1, "cv_summary": "S"
    })
    assert response.status_code == 400
    assert "Max applicants reached" in response.json()["detail"]
