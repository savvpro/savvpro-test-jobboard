import pytest
from conftest import make_job_payload, make_application_payload

def test_apply_to_job_success(client):
    """Valid application submission returns 201 and pending status."""
    client.post("/api/jobs", json=make_job_payload())
    payload = make_application_payload()
    response = client.post("/api/jobs/1/apply", json=payload)
    
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "pending"
    assert data["applicant_name"] == payload["applicant_name"]
    assert data["email"] == payload["email"]
    assert isinstance(data["id"], int)

def test_duplicate_application_blocked(client):
    """Same email applying to same job twice returns 409."""
    client.post("/api/jobs", json=make_job_payload())
    payload = make_application_payload(email="double@example.com")
    
    # First app
    res1 = client.post("/api/jobs/1/apply", json=payload)
    assert res1.status_code == 201
    
    # Second app
    res2 = client.post("/api/jobs/1/apply", json=payload)
    assert res2.status_code == 409
    assert "already applied" in res2.json()["detail"].lower()

def test_apply_to_closed_job(client):
    """Applying to a closed job returns 422."""
    client.post("/api/jobs", json=make_job_payload())
    client.patch("/api/jobs/1/close")
    
    response = client.post("/api/jobs/1/apply", json=make_application_payload())
    assert response.status_code == 422
    assert "closed" in response.json()["detail"].lower()

def test_apply_after_deadline(client):
    """Applying to an expired job returns 422."""
    client.post("/api/jobs", json=make_job_payload(deadline="2000-01-01"))
    
    response = client.post("/api/jobs/1/apply", json=make_application_payload())
    assert response.status_code == 422
    assert "deadline" in response.json()["detail"].lower()

def test_max_applicants_cap(client):
    """When max_applicants is reached, further applications return 422."""
    client.post("/api/jobs", json=make_job_payload(max_applicants=2))
    
    client.post("/api/jobs/1/apply", json=make_application_payload(email="app1@example.com"))
    client.post("/api/jobs/1/apply", json=make_application_payload(email="app2@example.com"))
    
    response = client.post("/api/jobs/1/apply", json=make_application_payload(email="app3@example.com"))
    assert response.status_code == 422
    assert "no longer accepting" in response.json()["detail"].lower()

def test_invalid_linkedin_url(client):
    """linkedin_url not starting with linkedin.com domain returns 422."""
    client.post("/api/jobs", json=make_job_payload())
    payload = make_application_payload(linkedin_url="https://twitter.com/hiring")
    
    response = client.post("/api/jobs/1/apply", json=payload)
    # Note: Pydantic validation error is usually 422
    assert response.status_code == 422

def test_valid_linkedin_url_formats(client):
    """Both linkedin.com and www.linkedin.com are accepted."""
    client.post("/api/jobs", json=make_job_payload())
    
    res1 = client.post("/api/jobs/1/apply", json=make_application_payload(
        email="jane1@example.com",
        linkedin_url="https://linkedin.com/in/jane"
    ))
    assert res1.status_code == 201
    
    client.post("/api/jobs", json=make_job_payload()) # Job 2
    res2 = client.post("/api/jobs/2/apply", json=make_application_payload(
        email="jane2@example.com",
        linkedin_url="https://www.linkedin.com/in/jane"
    ))
    assert res2.status_code == 201
