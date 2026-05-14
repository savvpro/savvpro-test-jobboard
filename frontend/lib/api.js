/**
 * API client for communicating with the FastAPI backend.
 * Base URL defaults to http://localhost:8000 during development.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.detail || `Request failed with status ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return data;
}

// ── Jobs ──

export async function fetchJobs(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      query.append(key, val);
    }
  });
  return request(`/api/jobs?${query.toString()}`);
}

export async function fetchJob(id) {
  return request(`/api/jobs/${id}`);
}

export async function createJob(payload) {
  return request("/api/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function closeJob(id) {
  return request(`/api/jobs/${id}/close`, { method: "PATCH" });
}

// ── Applications ──

export async function fetchApplications(jobId, status) {
  const query = status ? `?status=${status}` : "";
  return request(`/api/jobs/${jobId}/applications${query}`);
}

export async function submitApplication(jobId, payload) {
  return request(`/api/jobs/${jobId}/applications`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateApplicationStatus(appId, payload) {
  return request(`/api/applications/${appId}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function fetchApplicationHistory(appId) {
  return request(`/api/applications/${appId}/history`);
}

// ── Stats ──

export async function fetchStats() {
  return request("/api/stats");
}
