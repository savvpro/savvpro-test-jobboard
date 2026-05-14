import pytest
from conftest import make_job_payload, make_application_payload

def test_status_workflow_full_path(client):
    """Full happy path: pending → shortlisted → offered."""
    client.post("/api/jobs", json=make_job_payload())
    client.post("/api/jobs/1/apply", json=make_application_payload())
    
    # 1. Shortlist
    res1 = client.patch("/api/applications/1/status", json={"status": "shortlisted", "note": "Great CV"})
    assert res1.status_code == 200
    assert res1.json()["status"] == "shortlisted"
    
    # 2. Offer
    res2 = client.patch("/api/applications/1/status", json={"status": "offered", "note": "Approved for hire"})
    assert res2.status_code == 200
    assert res2.json()["status"] == "offered"

def test_backwards_transition_blocked(client):
    """Moving status backwards (shortlisted → pending) must return 400."""
    client.post("/api/jobs", json=make_job_payload())
    client.post("/api/jobs/1/apply", json=make_application_payload())
    client.patch("/api/applications/1/status", json={"status": "shortlisted", "note": "note"})
    
    res = client.patch("/api/applications/1/status", json={"status": "pending", "note": "Oops"})
    assert res.status_code == 400
    assert "cannot transition" in res.json()["detail"].lower()

def test_rejected_is_terminal(client):
    """Rejected application cannot be moved to any other status."""
    client.post("/api/jobs", json=make_job_payload())
    client.post("/api/jobs/1/apply", json=make_application_payload())
    client.patch("/api/applications/1/status", json={"status": "rejected", "note": "rejecting"})
    
    for s in ["pending", "shortlisted", "offered"]:
        res = client.patch("/api/applications/1/status", json={"status": s, "note": "retry"})
        assert res.status_code == 400

def test_offered_cannot_go_to_shortlisted(client):
    """offered → shortlisted is invalid (backwards)."""
    client.post("/api/jobs", json=make_job_payload())
    client.post("/api/jobs/1/apply", json=make_application_payload())
    client.patch("/api/applications/1/status", json={"status": "shortlisted", "note": "s"})
    client.patch("/api/applications/1/status", json={"status": "offered", "note": "o"})
    
    res = client.patch("/api/applications/1/status", json={"status": "shortlisted", "note": "back"})
    assert res.status_code == 400

def test_status_update_requires_note(client):
    """Status update without a note returns 422."""
    client.post("/api/jobs", json=make_job_payload())
    client.post("/api/jobs/1/apply", json=make_application_payload())
    
    res1 = client.patch("/api/applications/1/status", json={"status": "shortlisted", "note": ""})
    assert res1.status_code == 422
    
    res2 = client.patch("/api/applications/1/status", json={"status": "shortlisted"})
    assert res2.status_code == 422

def test_close_job_auto_rejects_pending(client):
    """Closing a job auto-rejects all pending applications."""
    client.post("/api/jobs", json=make_job_payload())
    client.post("/api/jobs/1/apply", json=make_application_payload(email="app1@example.com"))
    client.post("/api/jobs/1/apply", json=make_application_payload(email="app2@example.com"))
    client.post("/api/jobs/1/apply", json=make_application_payload(email="app3@example.com"))
    
    client.patch("/api/applications/2/status", json={"status": "shortlisted", "note": "s"})
    client.patch("/api/applications/3/status", json={"status": "shortlisted", "note": "s"})
    client.patch("/api/applications/3/status", json={"status": "offered", "note": "o"})
    
    # Close job
    client.patch("/api/jobs/1/close")
    
    apps = client.get("/api/jobs/1/applications").json()
    # Ordered by created_at desc, so app3, app2, app1
    app1 = next(a for a in apps if a["email"] == "app1@example.com")
    app2 = next(a for a in apps if a["email"] == "app2@example.com")
    app3 = next(a for a in apps if a["email"] == "app3@example.com")
    
    assert app1["status"] == "rejected"
    assert app2["status"] == "shortlisted"
    assert app3["status"] == "offered"

def test_status_history_preserved(client):
    """Every status transition is recorded in history."""
    client.post("/api/jobs", json=make_job_payload())
    client.post("/api/jobs/1/apply", json=make_application_payload())
    client.patch("/api/applications/1/status", json={"status": "shortlisted", "note": "Note 1"})
    client.patch("/api/applications/1/status", json={"status": "offered", "note": "Note 2"})
    
    app = client.get("/api/jobs/1/applications").json()[0]
    history = app["status_history"]
    
    # Initial "Applied" entry + 2 transitions = 3
    assert len(history) == 3
    assert history[0]["to_status"] == "pending"
    assert history[1]["to_status"] == "shortlisted"
    assert history[2]["to_status"] == "offered"
    assert history[1]["note"] == "Note 1"

def test_stats_endpoint(client):
    """Stats endpoint returns accurate live counts."""
    # 1. Initially zero
    res = client.get("/api/stats")
    assert res.json()["total_jobs"] == 0
    
    # 2. Create 3 jobs
    client.post("/api/jobs", json=make_job_payload(title="J1", department="Eng"))
    client.post("/api/jobs", json=make_job_payload(title="J2", department="Eng"))
    client.post("/api/jobs", json=make_job_payload(title="J3", department="Sales"))
    
    # 3. Close 1 job
    client.patch("/api/jobs/1/close")
    
    # 4. Apply to Job 2 (which is open) with 2 applicants
    client.post("/api/jobs/2/apply", json=make_application_payload(email="a1@ex.com"))
    client.post("/api/jobs/2/apply", json=make_application_payload(email="a2@ex.com"))
    
    res2 = client.get("/api/stats")
    data = res2.json()
    assert data["total_jobs"] == 3
    assert data["open_jobs"] == 2
    assert data["closed_jobs"] == 1
    assert data["total_applications"] == 2
    assert data["avg_applications_per_job"] == pytest.approx(2/3, rel=1e-2)
    assert data["top_department"] == "Eng"
