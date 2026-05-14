"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchJob, closeJob, submitApplication } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";

/**
 * Job Detail page — Shows full job description, skills, and an apply form.
 * Route: /jobs/[id]
 */
export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Apply form
  const [showApply, setShowApply] = useState(false);
  const [formData, setFormData] = useState({
    applicant_name: "",
    email: "",
    years_experience: "",
    cv_summary: "",
    linkedin_url: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  async function loadJob() {
    try {
      const data = await fetchJob(jobId);
      setJob(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (jobId) loadJob();
  }, [jobId]);

  async function handleApply(e) {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError("");
    try {
      await submitApplication(jobId, {
        ...formData,
        years_experience: parseInt(formData.years_experience, 10),
        linkedin_url: formData.linkedin_url || undefined,
      });
      setSubmitSuccess(true);
      setShowApply(false);
      loadJob(); // refresh count
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleClose() {
    if (!confirm("Are you sure you want to close this job listing? All pending applications will be auto-rejected.")) return;
    try {
      const updated = await closeJob(jobId);
      setJob(updated);
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem 0" }}>
        <div className="skeleton" style={{ height: "40px", width: "60%", marginBottom: "1rem" }} />
        <div className="skeleton" style={{ height: "200px", marginBottom: "1rem" }} />
        <div className="skeleton" style={{ height: "300px" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "4rem 0", textAlign: "center" }}>
        <p className="alert alert-error">{error}</p>
        <Link href="/" className="btn btn-secondary">← Back to Jobs</Link>
      </div>
    );
  }

  const salaryRange = `$${(job.salary_min / 1000).toFixed(0)}k – $${(job.salary_max / 1000).toFixed(0)}k`;
  const deadlineDate = new Date(job.deadline).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Back link */}
      <div style={{ padding: "1.5rem 0 0.5rem" }}>
        <Link href="/" style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>← Back to Jobs</Link>
      </div>

      {/* Job header */}
      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.75rem" }}>{job.title}</h1>
            <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0.75rem" }}>{job.department}</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <StatusBadge status={job.location} />
              <StatusBadge status={job.status} />
              <span className="badge" style={{ background: "rgba(99, 102, 241, 0.1)", color: "var(--primary-light)" }}>
                {salaryRange}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {job.status === "open" && (
              <button className="btn btn-danger btn-sm" onClick={handleClose}>Close Listing</button>
            )}
            <Link href={`/jobs/${job.id}/applications`} className="btn btn-secondary btn-sm">
              View Applications ({job.application_count})
            </Link>
          </div>
        </div>
      </div>

      {/* Job details */}
      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginTop: 0 }}>Description</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{job.description}</p>

        <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>Required Skills</h2>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {job.required_skills?.map((skill) => (
            <span key={skill} style={{ padding: "0.375rem 0.75rem", borderRadius: "8px", background: "rgba(6, 182, 212, 0.1)", color: "var(--accent)", fontSize: "0.813rem" }}>
              {skill}
            </span>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1.5rem" }}>
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0 0 0.25rem" }}>Deadline</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{deadlineDate}</p>
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0 0 0.25rem" }}>Max Applicants</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{job.max_applicants ?? "Unlimited"}</p>
          </div>
        </div>
      </div>

      {/* Apply section */}
      {submitSuccess ? (
        <div className="alert alert-success">
          ✅ Your application has been submitted successfully!
        </div>
      ) : job.status === "open" ? (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>Apply for this Position</h2>
            <button className="btn btn-primary" onClick={() => setShowApply(!showApply)}>
              {showApply ? "Cancel" : "Apply Now"}
            </button>
          </div>

          {showApply && (
            <form onSubmit={handleApply}>
              {submitError && <p className="alert alert-error">{submitError}</p>}

              <div className="form-group">
                <label htmlFor="applicant_name">Full Name *</label>
                <input id="applicant_name" className="form-input" required value={formData.applicant_name} onChange={(e) => setFormData({ ...formData, applicant_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input id="email" className="form-input" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="years_experience">Years of Experience *</label>
                <input id="years_experience" className="form-input" type="number" min="0" required value={formData.years_experience} onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="cv_summary">CV Summary * (max 1000 chars)</label>
                <textarea id="cv_summary" className="form-textarea" required maxLength={1000} value={formData.cv_summary} onChange={(e) => setFormData({ ...formData, cv_summary: e.target.value })} />
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{formData.cv_summary.length}/1000</span>
              </div>
              <div className="form-group">
                <label htmlFor="linkedin_url">LinkedIn URL (optional)</label>
                <input id="linkedin_url" className="form-input" placeholder="https://linkedin.com/in/..." value={formData.linkedin_url} onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })} />
              </div>
              <button className="btn btn-primary" type="submit" disabled={submitLoading}>
                {submitLoading ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="alert alert-error">This job listing is closed and no longer accepting applications.</div>
      )}
    </div>
  );
}
