"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, Job } from "@/lib/api";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const jobId = Number(id);

  const [job, setJob]           = useState<Job | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  // Form state
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [experience, setExp]    = useState(0);
  const [cvSummary, setCv]      = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    api.getJob(jobId)
      .then(setJob)
      .catch(() => setError("Job not found."))
      .finally(() => setLoading(false));
  }, [jobId]);

  const isExpired = job ? new Date(job.deadline) < new Date() : false;
  const canApply  = job && !job.is_closed && !isExpired;

  const validateLinkedin = (url: string) =>
    !url ||
    url.startsWith("https://linkedin.com/") ||
    url.startsWith("https://www.linkedin.com/");

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!name.trim() || !email.trim() || !cvSummary.trim()) {
      setFormError("Name, email, and CV summary are required.");
      return;
    }
    if (cvSummary.length > 1000) {
      setFormError("CV summary must be 1000 characters or fewer.");
      return;
    }
    if (!validateLinkedin(linkedin)) {
      setFormError("LinkedIn URL must start with https://linkedin.com/ or https://www.linkedin.com/");
      return;
    }

    setSubmitting(true);
    try {
      await api.applyToJob(jobId, {
        applicant_name: name,
        email,
        years_experience: experience,
        cv_summary: cvSummary,
        linkedin_url: linkedin || undefined,
      });
      setFormSuccess("✅ Application submitted! You'll hear back soon.");
      setName(""); setEmail(""); setExp(0); setCv(""); setLinkedin("");
    } catch (e: unknown) {
      const err = e as { status?: number; detail?: string };
      if (err?.status === 409) {
        setFormError("You have already applied to this position.");
      } else {
        setFormError(err?.detail ?? "Submission failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="skeleton-card" style={{ height: 40, width: 120, marginBottom: "1.5rem", borderRadius: 6 }} />
        <div className="skeleton-card" style={{ height: 300 }} />
      </div>
    );
  }

  if (error || !job) {
    return (
      <>
        <Link href="/" className="back-link">← Back to jobs</Link>
        <p className="form-error">{error || "Job not found."}</p>
      </>
    );
  }

  return (
    <>
      <Link href="/" className="back-link">← Back to jobs</Link>

      <div className="job-detail-layout">
        {/* Left: Job info */}
        <div className="job-detail-main">
          <div className="detail-card">
            <h1 className="job-detail-title">{job.title}</h1>
            <div className="job-detail-meta">
              <span className="meta-pill">🏢 <strong>{job.department}</strong></span>
              <span className="meta-pill">📍 {job.location}</span>
              <span className="meta-pill">
                💰 <strong>${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()}</strong>
              </span>
              <span className="meta-pill">
                📅 Deadline: <strong>{new Date(job.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>
              </span>
              {job.max_applicants && (
                <span className="meta-pill">👥 Max {job.max_applicants} applicants</span>
              )}
            </div>
            {job.is_closed && <div className="job-closed-notice">⛔ This listing is closed — applications are no longer accepted.</div>}
            {!job.is_closed && isExpired && <div className="job-closed-notice">⏰ This listing has passed its deadline.</div>}
          </div>

          <div className="detail-card">
            <h2>📋 Job Description</h2>
            <p className="description-text">{job.description}</p>
          </div>

          <div className="detail-card">
            <h2>🛠 Required Skills</h2>
            <div className="skills-list">
              {job.required_skills.map((skill) => (
                <span key={skill} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>

          {/* Manager panel */}
          <div className="close-job-banner">
            <p>🔒 <strong>Hiring Manager:</strong> Close this job to stop accepting applications.</p>
            <button
              id="close-job-btn"
              className="btn-danger"
              disabled={job.is_closed}
              onClick={async () => {
                if (!confirm("Close this job? All pending applications will be auto-rejected.")) return;
                try {
                  const updated = await api.closeJob(jobId);
                  setJob(updated);
                } catch (e: unknown) {
                  const err = e as { detail?: string };
                  alert(err?.detail ?? "Failed to close job.");
                }
              }}
            >
              {job.is_closed ? "Job Closed" : "Close Job"}
            </button>
          </div>

          <Link
            href={`/jobs/${jobId}/applications`}
            className="btn-secondary"
            style={{ textAlign: "center", display: "block" }}
            id="view-applications-link"
          >
            📂 View Applications Pipeline
          </Link>
        </div>

        {/* Right: Apply form */}
        <div className="apply-card">
          <h2>Apply for this role</h2>

          {!canApply ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Applications are not currently being accepted for this listing.
            </p>
          ) : (
            <form onSubmit={handleApply} id="apply-form" noValidate>
              {formError   && <p className="form-error">{formError}</p>}
              {formSuccess && <p className="form-success">{formSuccess}</p>}

              <div className="form-group">
                <label htmlFor="applicant-name">Full Name *</label>
                <input id="applicant-name" type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Jane Doe" />
              </div>

              <div className="form-group">
                <label htmlFor="applicant-email">Email *</label>
                <input id="applicant-email" type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="jane@example.com" />
              </div>

              <div className="form-group">
                <label htmlFor="applicant-experience">Years of Experience *</label>
                <input id="applicant-experience" type="number" className="form-input" value={experience} min={0} onChange={(e) => setExp(Number(e.target.value))} required />
              </div>

              <div className="form-group">
                <label htmlFor="cv-summary">CV Summary * (max 1000 chars)</label>
                <textarea
                  id="cv-summary"
                  className="form-textarea"
                  value={cvSummary}
                  onChange={(e) => setCv(e.target.value)}
                  maxLength={1000}
                  required
                  placeholder="Brief summary of your experience and why you're a great fit…"
                />
                <span className={`char-counter ${cvSummary.length > 1000 ? "over" : ""}`}>
                  {cvSummary.length}/1000
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="linkedin-url">LinkedIn URL (optional)</label>
                <input
                  id="linkedin-url"
                  type="url"
                  className="form-input"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <button id="submit-application-btn" type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Submitting…" : "Submit Application"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
