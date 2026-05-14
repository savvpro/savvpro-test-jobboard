import pytest
from conftest import make_job_payload

def test_create_job_success(client):
    """POST /api/jobs with valid data returns 201 and correct response body."""
    payload = make_job_payload()
    response = client.post("/api/jobs", json=payload)
    
    assert response.status_code == 201
    data = response.json()
    
    # Assert response body contains all submitted fields
    assert data["title"] == payload["title"]
    assert data["department"] == payload["department"]
    assert data["description"] == payload["description"]
    assert data["location"] == payload["location"]
    assert data["salary_min"] == payload["salary_min"]
    assert data["salary_max"] == payload["salary_max"]
    assert data["required_skills"] == payload["required_skills"]
    assert data["deadline"] == payload["deadline"]
    
    # Assert id and metadata
    assert isinstance(data["id"], int)
    assert data["is_closed"] is False
    assert "created_at" in data

def test_salary_validation_equal(client):
    """salary_min == salary_max returns 422."""
    payload = make_job_payload(salary_min=80000, salary_max=80000)
    response = client.post("/api/jobs", json=payload)
    assert response.status_code == 422
    assert "detail" in response.json()

def test_salary_validation_min_greater(client):
    """salary_min > salary_max returns 422."""
    payload = make_job_payload(salary_min=120000, salary_max=80000)
    response = client.post("/api/jobs", json=payload)
    assert response.status_code == 422

def test_required_skills_empty(client):
    """required_skills as empty list returns 422."""
    payload = make_job_payload(required_skills=[])
    response = client.post("/api/jobs", json=payload)
    assert response.status_code == 422

def test_list_jobs_pagination(client):
    """Create 15 jobs, page 2 with per_page=5 returns correct slice."""
    for i in range(15):
        client.post("/api/jobs", json=make_job_payload(title=f"Job {i+1}"))
    
    response = client.get("/api/jobs?page=2&per_page=5")
    assert response.status_code == 200
    data = response.json()
    
    assert data["total_count"] == 15
    assert data["page"] == 2
    assert data["per_page"] == 5
    assert len(data["results"]) == 5
    # Since they are ordered by creation (default by id for offset/limit),
    # and we created them Job 1 to Job 15.
    # Page 1: 1, 2, 3, 4, 5
    # Page 2: 6, 7, 8, 9, 10
    titles = [j["title"] for j in data["results"]]
    assert "Job 6" in titles
    assert "Job 10" in titles

def test_list_jobs_filters_department(client):
    """Department filter returns only matching jobs."""
    for _ in range(3):
        client.post("/api/jobs", json=make_job_payload(department="Engineering"))
    for _ in range(2):
        client.post("/api/jobs", json=make_job_payload(department="Design"))
        
    response = client.get("/api/jobs?department=Engineering")
    assert response.status_code == 200
    data = response.json()
    assert data["total_count"] == 3
    for job in data["results"]:
        assert job["department"] == "Engineering"

def test_list_jobs_excludes_closed_by_default(client):
    """Closed jobs are excluded from default listing."""
    client.post("/api/jobs", json=make_job_payload())
    client.post("/api/jobs", json=make_job_payload())
    
    # Close first job
    client.patch("/api/jobs/1/close")
    
    # Default listing
    response = client.get("/api/jobs")
    assert response.status_code == 200
    assert len(response.json()["results"]) == 1
    
    # With include_closed
    response = client.get("/api/jobs?include_closed=true")
    assert len(response.json()["results"]) == 2

def test_list_jobs_excludes_expired(client):
    """Jobs with past deadlines are excluded from default listing."""
    client.post("/api/jobs", json=make_job_payload(deadline="2000-01-01"))
    client.post("/api/jobs", json=make_job_payload(deadline="2099-12-31"))
    
    response = client.get("/api/jobs")
    assert response.status_code == 200
    assert len(response.json()["results"]) == 1
    assert response.json()["results"][0]["deadline"] == "2099-12-31"

def test_get_single_job(client):
    """GET /api/jobs/{id} returns the correct job."""
    client.post("/api/jobs", json=make_job_payload(title="Unique Job"))
    response = client.get("/api/jobs/1")
    assert response.status_code == 200
    assert response.json()["title"] == "Unique Job"

def test_get_job_not_found(client):
    """GET /api/jobs/999 returns 404."""
    response = client.get("/api/jobs/999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Job not found"
