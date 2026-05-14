export interface Application {
  id: number;
  applicant_name: string;
  email: string;
  years_experience: number;
  cv_summary: string;
  linkedin_url: string | null;
  status: "pending" | "shortlisted" | "offered" | "rejected";
  applied_at: string;
}

export interface HistoryEvent {
  id: number;
  from_status: string;
  to_status: string;
  note: string;
  timestamp: string;
}
