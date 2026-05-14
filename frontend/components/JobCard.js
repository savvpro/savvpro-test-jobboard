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

  return (
    <Link href={`/jobs/${job.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div className="card" id={`job-card-${job.id}`} style={{ cursor: "pointer", height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>{job.title}</h3>
            <p style={{ margin: "0.25rem 0 0", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              {job.department}
            </p>
          </div>
          <StatusBadge status={job.status} />
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
          <StatusBadge status={job.location} />
          <span className="badge" style={{ background: "rgba(99, 102, 241, 0.1)", color: "var(--primary-light)" }}>
            {salaryRange}
          </span>
        </div>

        <p style={{ color: "var(--text-secondary)", fontSize: "0.813rem", lineHeight: 1.5, margin: "0 0 0.75rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {job.description}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginBottom: "0.75rem" }}>
          {job.required_skills?.slice(0, 4).map((skill) => (
            <span
              key={skill}
              style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", borderRadius: "6px", background: "rgba(6, 182, 212, 0.1)", color: "var(--accent)" }}
            >
              {skill}
            </span>
          ))}
          {job.required_skills?.length > 4 && (
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>+{job.required_skills.length - 4}</span>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
          <span>📅 Deadline: {deadlineDate}</span>
          <span>📋 {job.application_count} applicant{job.application_count !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </Link>
  );
}
