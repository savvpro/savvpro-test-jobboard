export interface JobResponse {
  id: number;
  title: string;
  department: string;
  description: string;
  location: string;
  salary_min: number;
  salary_max: number;
  required_skills: string[];
  max_applicants: number | null;
  deadline: string;
  is_closed: boolean;
}

export interface BrowseJobsResponse {
  total_count: number;
  page: number;
  per_page: number;
  results: JobResponse[];
}
