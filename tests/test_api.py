"""
Tests for JobBoard Pro — covers all 6 features.
Minimum 5 tests required; we provide 10+ for thorough coverage.

Includes:
  - Status workflow test (required)
  - Pagination test (required)
  - Job creation & validation
  - Application business rules
  - Analytics endpoint
  - Close job with auto-reject
"""

import sys
import os
import pytest
from datetime import date, timedelta

# Ensure backend is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

# Patch the database module BEFORE any other backend imports
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Use StaticPool to share a single in-memory database across connections
TEST_ENGINE = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSession = sessionmaker(autocommit=False, autoflush=False, bind=TEST_ENGINE)

# Monkey-patch the database module so all downstream imports use the test engine
import database
database.engine = TEST_ENGINE
database.SessionLocal = TestSession

# Now import everything else
from database import Base, get_db
from models import Job, Application, ApplicationHistory  # noqa: F401 — register models
from main import app

from fastapi.testclient import TestClient


def override_get_db():
    db = TestSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    """Create fresh tables for each test, then tear them down."""
    Base.metadata.create_all(bind=TEST_ENGINE)
    yield
    Base.metadata.drop_all(bind=TEST_ENGINE)


# Use context manager so lifespan/startup events fire
@pytest.fixture()
def c():
    with TestClient(app) as tc:
        yield tc


# ── Helpers ──

FUTURE_DATE = (date.today() + timedelta(days=30)).isoformat()


def create_sample_job(c, **overrides):
    """Helper to create a job with sensible defaults."""
    payload = {
        "title": "Software Engineer",
        "department": "Engineering",
        "description": "Build great software.",
        "location": "remote",
        "salary_min": 80000,
        "salary_max": 120000,
        "required_skills": ["Python", "FastAPI"],
        "deadline": FUTURE_DATE,
    }
    payload.update(overrides)
    return c.post("/api/jobs", json=payload)


def create_sample_application(c, job_id: int, **overrides):
    """Helper to submit an application with sensible defaults."""
    payload = {
        "applicant_name": "Jane Doe",
        "email": "jane@example.com",
        "years_experience": 5,
        "cv_summary": "Experienced full-stack developer with Python expertise.",
    }
    payload.update(overrides)
    return c.post(f"/api/jobs/{job_id}/applications", json=payload)


# ══════════════════════════════════════════
# TEST 1 — Create Job (Feature 1)
# ══════════════════════════════════════════

def test_create_job_success(c):
    """A valid job listing is created and returns 201."""
    resp = create_sample_job(c)
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Software Engineer"
    assert data["department"] == "Engineering"
    assert data["status"] == "open"
    assert data["id"] is not None


def test_create_job_salary_validation(c):
    """salary_min must be strictly less than salary_max."""
    resp = create_sample_job(c, salary_min=100000, salary_max=80000)
    assert resp.status_code == 422


# ══════════════════════════════════════════
# TEST 2 — Pagination (Feature 2) [REQUIRED]
# ══════════════════════════════════════════

def test_pagination(c):
    """Jobs list supports page/per_page and returns correct metadata."""
    for i in range(5):
        create_sample_job(c, title=f"Job {i}")

    # Page 1, per_page=2
    resp = c.get("/api/jobs", params={"page": 1, "per_page": 2})
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_count"] == 5
    assert data["page"] == 1
    assert data["per_page"] == 2
    assert len(data["results"]) == 2

    # Page 3, per_page=2 should have 1 result
    resp = c.get("/api/jobs", params={"page": 3, "per_page": 2})
    data = resp.json()
    assert len(data["results"]) == 1


# ══════════════════════════════════════════
# TEST 3 — Apply to Job (Feature 3)
# ══════════════════════════════════════════

def test_apply_success(c):
    """A valid application is created and starts with status 'pending'."""
    job_resp = create_sample_job(c)
    job_id = job_resp.json()["id"]

    resp = create_sample_application(c, job_id)
    assert resp.status_code == 201
    data = resp.json()
    assert data["status"] == "pending"
    assert data["applicant_name"] == "Jane Doe"


def test_apply_duplicate_blocked(c):
    """Same email cannot apply twice to the same job."""
    job_resp = create_sample_job(c)
    job_id = job_resp.json()["id"]

    create_sample_application(c, job_id)
    resp = create_sample_application(c, job_id)
    assert resp.status_code == 409


def test_apply_max_applicants_reached(c):
    """Applications are blocked when max_applicants cap is reached."""
    job_resp = create_sample_job(c, max_applicants=1)
    job_id = job_resp.json()["id"]

    create_sample_application(c, job_id, email="first@example.com")

    resp = create_sample_application(c, job_id, email="second@example.com")
    assert resp.status_code == 400
    assert "maximum" in resp.json()["detail"].lower()


# ══════════════════════════════════════════
# TEST 4 — Status Workflow (Feature 4) [REQUIRED]
# ══════════════════════════════════════════

def test_status_workflow_valid_transitions(c):
    """Test the full happy-path: pending → shortlisted → offered."""
    job_resp = create_sample_job(c)
    job_id = job_resp.json()["id"]
    app_resp = create_sample_application(c, job_id)
    app_id = app_resp.json()["id"]

    # pending → shortlisted
    resp = c.patch(
        f"/api/applications/{app_id}/status",
        json={"status": "shortlisted", "note": "Strong candidate"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "shortlisted"

    # shortlisted → offered
    resp = c.patch(
        f"/api/applications/{app_id}/status",
        json={"status": "offered", "note": "Extending offer"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "offered"


def test_status_workflow_invalid_backward_transition(c):
    """Backward transitions are rejected (e.g. shortlisted → pending)."""
    job_resp = create_sample_job(c)
    job_id = job_resp.json()["id"]
    app_resp = create_sample_application(c, job_id)
    app_id = app_resp.json()["id"]

    c.patch(
        f"/api/applications/{app_id}/status",
        json={"status": "shortlisted", "note": "Advancing"},
    )

    resp = c.patch(
        f"/api/applications/{app_id}/status",
        json={"status": "pending", "note": "Trying to revert"},
    )
    assert resp.status_code == 400
    assert "invalid" in resp.json()["detail"].lower()


def test_status_history_preserved(c):
    """Status change history is recorded as an audit log."""
    job_resp = create_sample_job(c)
    job_id = job_resp.json()["id"]
    app_resp = create_sample_application(c, job_id)
    app_id = app_resp.json()["id"]

    c.patch(f"/api/applications/{app_id}/status", json={"status": "shortlisted", "note": "Good fit"})
    c.patch(f"/api/applications/{app_id}/status", json={"status": "rejected", "note": "Changed mind"})

    resp = c.get(f"/api/applications/{app_id}/history")
    assert resp.status_code == 200
    history = resp.json()
    assert len(history) == 3
    assert history[0]["new_status"] == "pending"
    assert history[1]["new_status"] == "shortlisted"
    assert history[2]["new_status"] == "rejected"


# ══════════════════════════════════════════
# TEST 5 — Analytics (Feature 5)
# ══════════════════════════════════════════

def test_stats_endpoint(c):
    """Stats endpoint returns computed analytics."""
    create_sample_job(c, department="Engineering")
    create_sample_job(c, department="Engineering", title="Backend Dev")
    create_sample_job(c, department="Design", title="UI Designer")

    resp = c.get("/api/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_jobs"] == 3
    assert data["open_jobs"] == 3
    assert data["closed_jobs"] == 0
    assert data["top_department"] == "Engineering"


# ══════════════════════════════════════════
# TEST 6 — Close Job (Feature 6)
# ══════════════════════════════════════════

def test_close_job_auto_rejects_pending(c):
    """Closing a job auto-rejects pending applications."""
    job_resp = create_sample_job(c)
    job_id = job_resp.json()["id"]

    create_sample_application(c, job_id, email="alice@example.com")
    app2_resp = create_sample_application(c, job_id, email="bob@example.com")
    app2_id = app2_resp.json()["id"]

    c.patch(f"/api/applications/{app2_id}/status", json={"status": "shortlisted", "note": "Keep"})

    resp = c.patch(f"/api/jobs/{job_id}/close")
    assert resp.status_code == 200
    assert resp.json()["status"] == "closed"

    apps_resp = c.get(f"/api/jobs/{job_id}/applications")
    apps = apps_resp.json()
    statuses = {a["email"]: a["status"] for a in apps}
    assert statuses["alice@example.com"] == "rejected"
    assert statuses["bob@example.com"] == "shortlisted"
