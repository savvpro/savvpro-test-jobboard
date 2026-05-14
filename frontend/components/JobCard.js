"use client";

import Link from "next/link";
import StatusBadge from "./StatusBadge";

/**
 * JobCard — Renders a job listing card in the browse view.
 * Required reusable component per task spec.
 */
export default function JobCard({ job }) {
  const salaryRange = `$${(job.salary_min / 1000).toFixed(0)}k – $${(job.salary_max / 1000).toFixed(0)}k`;
  const deadlineDate = new Date(job.deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const isClosed = job.status === "closed";

  return (
    <Link href={`/jobs/${job.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <article className={`job-card ${isClosed ? "job-card-closed" : ""}`} id={`job-card-${job.id}`}>
        <div className="job-card-accent" aria-hidden="true" />
        <div className="job-card-top">
          <div>
            <div className="job-card-status-row">
              <StatusBadge status={job.status} />
              <span className="job-card-deadline">Deadline: {deadlineDate}</span>
            </div>
            <h3>{job.title}</h3>
            <p className="job-card-department">{job.department}</p>
          </div>
          <StatusBadge status={job.location} />
        </div>

        <div className="job-card-meta">
          <span>Salary {salaryRange}</span>
          <span>{job.application_count} applicant{job.application_count !== 1 ? "s" : ""}</span>
        </div>

        <p className="job-card-description">{job.description}</p>

        <div className="job-card-skills">
          {job.required_skills?.slice(0, 4).map((skill) => (
            <span key={skill} className="skill-chip">
              {skill}
            </span>
          ))}
          {job.required_skills?.length > 4 && <span className="skill-chip skill-chip-more">+{job.required_skills.length - 4} more</span>}
        </div>

        <div className="job-card-footer">
          <span className="job-card-footnote">View full details and applicant history</span>
          <span className="job-card-action">View Details →</span>
        </div>
      </article>
    </Link>
  );
}
