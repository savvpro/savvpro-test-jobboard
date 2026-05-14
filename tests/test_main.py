"""
Pytest suite for JobBoard Pro.
Uses an in-memory SQLite database — no file on disk.
"""
import sys
import os
from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Make sure the backend package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# ─── In-memory DB override — must be set up BEFORE importing app ───────────────

TEST_DATABASE_URL = "sqlite:///:memory:"

# StaticPool ensures ALL connections (create_all + TestClient) share one in-memory DB
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


from backend.database import Base, get_db  # noqa: E402
from backend.main import app               # noqa: E402

app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def reset_db():
    """Drop and recreate all tables before each test."""
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield


client = TestClient(app)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def future_date(days: int = 30) -> str:
    return (date.today() + timedelta(days=days)).isoformat()


def past_date(days: int = 1) -> str:
    return (date.today() - timedelta(days=days)).isoformat()


def create_job(overrides: dict = {}) -> dict:
    payload = {
        "title": "Software Engineer",
        "department": "Engineering",
        "description": "Build cool things.",
        "location": "remote",
        "salary_min": 60000,
        "salary_max": 90000,
        "required_skills": ["Python", "FastAPI"],
        "deadline": future_date(),
    }
    payload.update(overrides)
    resp = client.post("/api/jobs", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


def apply(job_id: int, email: str = "alice@example.com", overrides: dict = {}) -> dict:
    payload = {
        "applicant_name": "Alice",
        "email": email,
        "years_experience": 3,
        "cv_summary": "Experienced Python developer.",
    }
    payload.update(overrides)
    resp = client.post(f"/api/jobs/{job_id}/apply", json=payload)
    return resp


# ─── Test 1: Create a job returns 201 with correct fields ─────────────────────

def test_create_job_returns_201_with_correct_fields():
    resp = client.post(
        "/api/jobs",
        json={
            "title": "Data Engineer",
            "department": "Data",
            "description": "Work with pipelines.",
            "location": "hybrid",
            "salary_min": 70000,
            "salary_max": 100000,
            "required_skills": ["SQL", "Spark"],
            "deadline": future_date(),
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Data Engineer"
    assert data["department"] == "Data"
    assert data["location"] == "hybrid"
    assert data["salary_min"] == 70000
    assert data["salary_max"] == 100000
    assert "SQL" in data["required_skills"]
    assert data["is_closed"] is False
    assert "id" in data
    assert "created_at" in data


# ─── Test 2: salary_min >= salary_max returns 422 ─────────────────────────────

def test_salary_min_gte_salary_max_returns_422():
    resp = client.post(
        "/api/jobs",
        json={
            "title": "Bad Job",
            "department": "HR",
            "description": "...",
            "location": "onsite",
            "salary_min": 100000,
            "salary_max": 50000,
            "required_skills": ["Excel"],
            "deadline": future_date(),
        },
    )
    assert resp.status_code == 422
    body = resp.json()
    assert "detail" in body


def test_salary_min_equal_salary_max_returns_422():
    resp = client.post(
        "/api/jobs",
        json={
            "title": "Equal Salary Job",
            "department": "HR",
            "description": "...",
            "location": "onsite",
            "salary_min": 80000,
            "salary_max": 80000,
            "required_skills": ["Excel"],
            "deadline": future_date(),
        },
    )
    assert resp.status_code == 422


# ─── Test 3: Pagination returns correct page/per_page/total_count ─────────────

def test_pagination_returns_correct_metadata():
    # Create 5 jobs
    for i in range(5):
        create_job({"title": f"Job {i}", "department": f"Dept {i}"})

    resp = client.get("/api/jobs?page=1&per_page=2")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_count"] == 5
    assert data["page"] == 1
    assert data["per_page"] == 2
    assert len(data["results"]) == 2

    resp2 = client.get("/api/jobs?page=3&per_page=2")
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["page"] == 3
    assert len(data2["results"]) == 1  # 5th item


# ─── Test 4: Status workflow — apply → shortlist → reject ─────────────────────

def test_status_workflow_apply_shortlist_reject():
    job = create_job()
    job_id = job["id"]

    # Apply
    app_resp = apply(job_id)
    assert app_resp.status_code == 201
    app_data = app_resp.json()
    app_id = app_data["id"]
    assert app_data["current_status"] == "pending"
    assert len(app_data["status_history"]) == 1  # initial pending entry

    # Shortlist
    sl_resp = client.patch(
        f"/api/applications/{app_id}/status",
        json={"new_status": "shortlisted", "note": "Great profile"},
    )
    assert sl_resp.status_code == 200
    sl_data = sl_resp.json()
    assert sl_data["current_status"] == "shortlisted"
    assert len(sl_data["status_history"]) == 2

    # Reject
    rej_resp = client.patch(
        f"/api/applications/{app_id}/status",
        json={"new_status": "rejected", "note": "Not the right fit"},
    )
    assert rej_resp.status_code == 200
    rej_data = rej_resp.json()
    assert rej_data["current_status"] == "rejected"
    assert len(rej_data["status_history"]) == 3


# ─── Test 5: Apply after deadline returns 400 ─────────────────────────────────

def test_apply_after_deadline_returns_400():
    job = create_job({"deadline": past_date(1)})
    job_id = job["id"]

    resp = apply(job_id)
    assert resp.status_code == 400
    assert "deadline" in resp.json()["detail"].lower()


# ─── Test 6: Duplicate application returns 409 ────────────────────────────────

def test_duplicate_application_returns_409():
    job = create_job()
    job_id = job["id"]

    r1 = apply(job_id, email="dup@example.com")
    assert r1.status_code == 201

    r2 = apply(job_id, email="dup@example.com")
    assert r2.status_code == 409


# ─── Test 7: Invalid status transition returns 400 ────────────────────────────

def test_invalid_status_transition_returns_400():
    job = create_job()
    app_resp = apply(job["id"])
    app_id = app_resp.json()["id"]

    # pending → offered is invalid
    resp = client.patch(
        f"/api/applications/{app_id}/status",
        json={"new_status": "offered", "note": "Jumping ahead"},
    )
    assert resp.status_code == 400
    assert "Cannot transition" in resp.json()["detail"]


# ─── Test 8: Closing a job auto-rejects pending applications ──────────────────

def test_close_job_auto_rejects_pending():
    job = create_job()
    job_id = job["id"]

    app_resp = apply(job_id, email="pending@example.com")
    app_id = app_resp.json()["id"]

    close_resp = client.post(f"/api/jobs/{job_id}/close")
    assert close_resp.status_code == 200
    assert close_resp.json()["is_closed"] is True

    # Application should now be rejected
    app_detail = client.get(f"/api/applications/{app_id}").json()
    assert app_detail["current_status"] == "rejected"
    notes = [h["note"] for h in app_detail["status_history"]]
    assert any("Job closed" in n for n in notes)


# ─── Test 9: max_applicants cap returns 400 ───────────────────────────────────

def test_max_applicants_cap_blocks_new_application():
    job = create_job({"max_applicants": 1})
    job_id = job["id"]

    r1 = apply(job_id, email="first@example.com")
    assert r1.status_code == 201

    r2 = apply(job_id, email="second@example.com")
    assert r2.status_code == 400
    assert "maximum" in r2.json()["detail"].lower()


# ─── Test 10: Stats endpoint returns computed values ─────────────────────────

def test_stats_endpoint_returns_live_data():
    create_job({"department": "Engineering"})
    create_job({"department": "Engineering"})
    create_job({"department": "Marketing"})

    resp = client.get("/api/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_jobs"] == 3
    assert data["open_jobs"] == 3
    assert data["closed_jobs"] == 0
    assert data["total_applications"] == 0
    assert data["avg_applications_per_job"] == 0.0
    assert data["top_department"] == "Engineering"
