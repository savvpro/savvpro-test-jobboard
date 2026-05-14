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
    <div>
      <div style={{ padding: "1.5rem 0 0.5rem" }}>
        <Link href="/" className="text-link">← Back to Dashboard</Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <section className="lg:w-[60%]">
          <div className="card" style={{ marginBottom: "1rem" }}>
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
          </div>

          <article className="card">
            <h2 style={{ fontSize: "1rem", fontWeight: 600, marginTop: 0 }}>Job Description</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{job.description}</p>

            <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Required Skills</h3>
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
          </article>
        </section>

        <aside className="lg:w-[40%]">
          <div className="card" style={{ position: "sticky", top: "100px" }}>
            <div style={{ marginBottom: "1rem" }}>
              <h2 style={{ margin: 0 }}>Apply Now</h2>
              <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>Join the team shaping the future of recruitment.</p>
            </div>

            {submitSuccess ? (
              <div className="alert alert-success">✅ Your application has been submitted successfully!</div>
            ) : job.status === "open" ? (
              <form onSubmit={handleApply} className="space-y-stack-md">
                {submitError && <p className="alert alert-error">{submitError}</p>}

                <div className="space-y-1">
                  <label className="block font-label-md text-on-surface">Full Name</label>
                  <input className="form-input" value={formData.applicant_name} onChange={(e) => setFormData({ ...formData, applicant_name: e.target.value })} required />
                </div>

                <div className="space-y-1">
                  <label className="block font-label-md text-on-surface">Email Address</label>
                  <input className="form-input" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="space-y-1">
                    <label className="block font-label-md text-on-surface">Years of Experience</label>
                    <input className="form-input" min="0" type="number" value={formData.years_experience} onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-label-md text-on-surface">LinkedIn URL</label>
                    <input className="form-input" placeholder="linkedin.com/in/..." value={formData.linkedin_url} onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-label-md text-on-surface">CV Summary</label>
                  <textarea className="form-textarea" rows={4} value={formData.cv_summary} onChange={(e) => setFormData({ ...formData, cv_summary: e.target.value })} required />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p className="text-label-sm text-outline">Minimum 150 characters.</p>
                    <span className="text-label-sm text-outline">{formData.cv_summary.length} / 1000</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                  <button className="btn btn-primary" type="submit" disabled={submitLoading}>{submitLoading ? "Submitting..." : "Submit Application"}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowApply(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="alert alert-error">This job listing is closed and no longer accepting applications.</div>
            )}

            <div style={{ marginTop: "1rem" }}>
              <Link href={`/jobs/${job.id}/applications`} className="btn btn-secondary btn-sm">View Applications ({job.application_count})</Link>
            </div>
          </div>
        </aside>
      </div>

    </div>
  );
}
