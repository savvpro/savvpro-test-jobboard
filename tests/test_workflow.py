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

@pytest.fixture(scope="module", autouse=True)
def setup_workflow_data():
    # 1. Create a Job
    client.post("/api/jobs", json={
        "title": "Manager", "department": "Sales", "description": "Manage things.",
        "location": "onsite", "salary_min": 60000, "salary_max": 80000,
        "required_skills": ["Leadership"], "deadline": future_date()
    })
    
    # 2. Apply (Application ID 1)
    client.post("/api/jobs/1/apply", json={
        "applicant_name": "Tom", "email": "tom@example.com",
        "years_experience": 5, "cv_summary": "Great manager."
    })

def test_valid_workflow_transition():
    # Move pending -> shortlisted
    response = client.patch(
        "/api/applications/1/status",
        json={"status": "shortlisted", "note": "Looks promising."}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "shortlisted"

def test_invalid_backwards_transition():
    # Try to move shortlisted -> pending (Should Fail)
    response = client.patch(
        "/api/applications/1/status",
        json={"status": "pending", "note": "Wait, let's put them back."}
    )
    assert response.status_code == 400
    assert "Invalid transition" in response.json()["detail"]

def test_get_applications_with_filter():
    # Filter by shortlisted
    response = client.get("/api/jobs/1/applications?status=shortlisted")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["applicant_name"] == "Tom"
    
    # Filter by pending (Should be empty now)
    response_pending = client.get("/api/jobs/1/applications?status=pending")
    assert response_pending.status_code == 200
    assert len(response_pending.json()) == 0