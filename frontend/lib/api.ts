export type LocationEnum = "remote" | "hybrid" | "onsite";
export type StatusEnum = "pending" | "shortlisted" | "offered" | "rejected";

export interface JobCreateInput {
  title: string;
  department: string;
  description: string;
  location: LocationEnum;
  salary_min: number;
  salary_max: number;
  required_skills: string[];
  max_applicants?: number | null;
  deadline: string; // YYYY-MM-DD
}

export interface Job extends JobCreateInput {
  id: number;
  is_closed: boolean;
  created_at: string;
}

export interface JobListResponse {
  total_count: number;
  page: number;
  per_page: number;
  results: Job[];
}

export interface StatusHistory {
  id: number;
  from_status: string | null;
  to_status: string;
  note: string;
  changed_at: string;
}

export interface ApplicationInput {
  applicant_name: string;
  email: string;
  years_experience: number;
  cv_summary: string;
  linkedin_url?: string | null;
}

export interface Application extends ApplicationInput {
  id: number;
  job_id: number;
  status: StatusEnum;
  created_at: string;
  status_history: StatusHistory[];
}

export interface StatusUpdateInput {
  status: StatusEnum;
  note: string;
}

export interface Stats {
  total_jobs: number;
  open_jobs: number;
  closed_jobs: number;
  total_applications: number;
  avg_applications_per_job: number;
  top_department: string | null;
}

export interface JobSearchParams {
  page?: number;
  per_page?: number;
  department?: string;
  location?: string;
  search?: string;
}

const API_BASE = "http://localhost:8000/api";

export async function getJobs(params: JobSearchParams): Promise<JobListResponse> {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page.toString());
  if (params.per_page) query.append("per_page", params.per_page.toString());
  if (params.department) query.append("department", params.department);
  if (params.location) query.append("location", params.location);
  if (params.search) query.append("search", params.search);

  const res = await fetch(`${API_BASE}/jobs?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch jobs");
  return res.json();
}

export async function getJob(id: number): Promise<Job> {
  const res = await fetch(`${API_BASE}/jobs/${id}`);
  if (!res.ok) throw new Error("Failed to fetch job");
  return res.json();
}

export async function createJob(data: JobCreateInput): Promise<Job> {
  const res = await fetch(`${API_BASE}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create job");
  return res.json();
}

export async function applyToJob(jobId: number, data: ApplicationInput): Promise<Application> {
  const res = await fetch(`${API_BASE}/jobs/${jobId}/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to submit application");
  return res.json();
}

export async function closeJob(jobId: number): Promise<Job> {
  const res = await fetch(`${API_BASE}/jobs/${jobId}/close`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to close job");
  return res.json();
}

export async function getApplications(jobId: number, status?: string): Promise<Application[]> {
  const url = status ? `${API_BASE}/jobs/${jobId}/applications?status=${status}` : `${API_BASE}/jobs/${jobId}/applications`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch applications");
  return res.json();
}

export async function updateApplicationStatus(appId: number, data: StatusUpdateInput): Promise<Application> {
  const res = await fetch(`${API_BASE}/applications/${appId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

export async function getStats(): Promise<Stats> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}
