"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createJob } from "@/lib/api";

/**
 * Post Job page — Form for hiring managers to create new job listings.
 * Route: /post-job
 */
export default function PostJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    description: "",
    location: "remote",
    salary_min: "",
    salary_max: "",
    required_skills: "",
    max_applicants: "",
    deadline: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        title: formData.title,
        department: formData.department,
        description: formData.description,
        location: formData.location,
        salary_min: parseInt(formData.salary_min, 10),
        salary_max: parseInt(formData.salary_max, 10),
        required_skills: formData.required_skills.split(",").map((s) => s.trim()).filter(Boolean),
        deadline: formData.deadline,
      };
      if (formData.max_applicants) {
        payload.max_applicants = parseInt(formData.max_applicants, 10);
      }

      const job = await createJob(payload);
      router.push(`/jobs/${job.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function updateField(field, value) {
    setFormData({ ...formData, [field]: value });
  }

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto" }}>
      <div className="page-header">
        <h1>Post a New Job</h1>
        <p>Create a new job listing for the hiring pipeline</p>
      </div>

      <div className="card">
        {error && <p className="alert alert-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Job Title *</label>
            <input id="title" className="form-input" required value={formData.title} onChange={(e) => updateField("title", e.target.value)} placeholder="e.g. Senior Software Engineer" />
          </div>

          <div className="form-group">
            <label htmlFor="department">Department *</label>
            <input id="department" className="form-input" required value={formData.department} onChange={(e) => updateField("department", e.target.value)} placeholder="e.g. Engineering" />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea id="description" className="form-textarea" required value={formData.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Describe the role, responsibilities, and what you're looking for..." style={{ minHeight: "120px" }} />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <select id="location" className="form-select" value={formData.location} onChange={(e) => updateField("location", e.target.value)}>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label htmlFor="salary_min">Salary Min ($) *</label>
              <input id="salary_min" className="form-input" type="number" min="0" required value={formData.salary_min} onChange={(e) => updateField("salary_min", e.target.value)} placeholder="e.g. 80000" />
            </div>
            <div className="form-group">
              <label htmlFor="salary_max">Salary Max ($) *</label>
              <input id="salary_max" className="form-input" type="number" min="0" required value={formData.salary_max} onChange={(e) => updateField("salary_max", e.target.value)} placeholder="e.g. 120000" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="required_skills">Required Skills * (comma-separated)</label>
            <input id="required_skills" className="form-input" required value={formData.required_skills} onChange={(e) => updateField("required_skills", e.target.value)} placeholder="e.g. Python, FastAPI, React" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label htmlFor="max_applicants">Max Applicants (optional)</label>
              <input id="max_applicants" className="form-input" type="number" min="1" value={formData.max_applicants} onChange={(e) => updateField("max_applicants", e.target.value)} placeholder="Leave empty for unlimited" />
            </div>
            <div className="form-group">
              <label htmlFor="deadline">Application Deadline *</label>
              <input id="deadline" className="form-input" type="date" required value={formData.deadline} onChange={(e) => updateField("deadline", e.target.value)} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Job Listing"}
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => router.push("/")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
