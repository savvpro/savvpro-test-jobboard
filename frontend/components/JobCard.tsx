"use client";

import { Job } from "@/lib/api";

interface JobCardProps {
  job: Job;
  onClick?: () => void;
}

const locationColors: Record<string, string> = {
  remote: "badge-remote",
  hybrid: "badge-hybrid",
  onsite: "badge-onsite",
};

export default function JobCard({ job, onClick }: JobCardProps) {
  const isExpired = new Date(job.deadline) < new Date();

  return (
    <div className="job-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="job-card-header">
        <div>
          <h3 className="job-title">{job.title}</h3>
          <p className="job-department">{job.department}</p>
        </div>
        <span className={`location-badge ${locationColors[job.location] ?? ""}`}>
          {job.location}
        </span>
      </div>

      <p className="job-description">
        {job.description.length > 120
          ? job.description.slice(0, 120) + "…"
          : job.description}
      </p>

      <div className="job-skills">
        {job.required_skills.slice(0, 5).map((skill) => (
          <span key={skill} className="skill-tag">
            {skill}
          </span>
        ))}
        {job.required_skills.length > 5 && (
          <span className="skill-tag skill-tag-more">
            +{job.required_skills.length - 5}
          </span>
        )}
      </div>

      <div className="job-card-footer">
        <div className="salary-range">
          ${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()}
        </div>
        <div className="deadline-info">
          {job.is_closed ? (
            <span className="closed-badge">Closed</span>
          ) : isExpired ? (
            <span className="expired-badge">Expired</span>
          ) : (
            <span className="deadline-text">
              Due {new Date(job.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
