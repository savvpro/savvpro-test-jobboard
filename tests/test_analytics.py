import sys
import os
import datetime
from datetime import timedelta
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
    return (datetime.date.today() + timedelta(days=days)).isoformat()

@pytest.fixture(scope="module", autouse=True)
def setup_final_data():
    # Job 1 (Will be closed)
    client.post("/api/jobs", json={
        "title": "QA Tester", "department": "Engineering", "description": "Test things.",
        "location": "remote", "salary_min": 50000, "salary_max": 70000,
        "required_skills": ["Selenium"], "deadline": future_date(30)
    })
    
    # Job 2 (Will stay open)
    client.post("/api/jobs", json={
        "title": "HR Manager", "department": "HR", "description": "Hire people.",
        "location": "onsite", "salary_min": 60000, "salary_max": 80000,
        "required_skills": ["Communication"], "deadline": future_date(30)
    })
    
    # Apply to Job 1 (Pending)
    client.post("/api/jobs/1/apply", json={
        "applicant_name": "Test User", "email": "test@test.com",
        "years_experience": 2, "cv_summary": "Good tester."
    })

def test_analytics_endpoint():
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_jobs"] == 2
    assert data["open_jobs"] == 2
    assert data["total_applications"] == 1
    assert data["avg_applications_per_job"] == 0.5
    assert data["top_department"] == "Engineering"

def test_manual_close_and_auto_reject():
    # Close Job 1
    close_response = client.patch("/api/jobs/1/close")
    assert close_response.status_code == 200
    assert close_response.json()["is_closed"] == True
    
    # Verify the pending application was auto-rejected
    apps_response = client.get("/api/jobs/1/applications")
    assert apps_response.status_code == 200
    apps_data = apps_response.json()
    assert apps_data[0]["status"] == "rejected"
    
    # Verify Stats updated correctly
    stats_response = client.get("/api/stats")
    assert stats_response.json()["open_jobs"] == 1
    assert stats_response.json()["closed_jobs"] == 1