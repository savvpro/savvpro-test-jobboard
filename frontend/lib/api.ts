const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Job {
  id: number;
  title: string;
  department: string;
  description: string;
  location: "remote" | "hybrid" | "onsite";
  salary_min: number;
  salary_max: number;
  required_skills: string[];
  max_applicants: number | null;
  deadline: string;
  is_closed: boolean;
  created_at: string;
}

export interface JobListResponse {
  total_count: number;
  page: number;
  per_page: number;
  results: Job[];
}

export interface StatusHistoryEntry {
  id: number;
  from_status: string | null;
  to_status: string;
  note: string;
  changed_at: string;
}

export interface Application {
  id: number;
  job_id: number;
  applicant_name: string;
  email: string;
  years_experience: number;
  cv_summary: string;
  linkedin_url: string | null;
  current_status: "pending" | "shortlisted" | "offered" | "rejected";
  created_at: string;
  status_history: StatusHistoryEntry[];
}

export interface Stats {
  total_jobs: number;
  open_jobs: number;
  closed_jobs: number;
  total_applications: number;
  avg_applications_per_job: number;
  top_department: string | null;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw { status: res.status, detail: err.detail ?? JSON.stringify(err) };
  }
  return res.json();
}

export const api = {
  getJobs: (params: Record<string, string | number | boolean>) => {
    const qs = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== "" && v !== undefined && v !== null)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return apiFetch<JobListResponse>(`/api/jobs${qs ? `?${qs}` : ""}`);
  },

  getJob: (id: number) => apiFetch<Job>(`/api/jobs/${id}`),

  createJob: (payload: unknown) =>
    apiFetch<Job>("/api/jobs", { method: "POST", body: JSON.stringify(payload) }),

  closeJob: (id: number) =>
    apiFetch<Job>(`/api/jobs/${id}/close`, { method: "POST" }),

  applyToJob: (jobId: number, payload: unknown) =>
    apiFetch<Application>(`/api/jobs/${jobId}/apply`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getApplications: (jobId: number, status?: string) => {
    const qs = status ? `?status=${status}` : "";
    return apiFetch<Application[]>(`/api/jobs/${jobId}/applications${qs}`);
  },

  updateStatus: (appId: number, payload: { new_status: string; note: string }) =>
    apiFetch<Application>(`/api/applications/${appId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  getStats: () => apiFetch<Stats>("/api/stats"),
};
