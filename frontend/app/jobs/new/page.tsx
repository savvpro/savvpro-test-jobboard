"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

const DEPARTMENTS = ["Engineering", "Marketing", "Sales", "Data", "Design", "Product", "HR", "Finance", "Operations"];
const LOCATIONS = ["remote", "hybrid", "onsite"];

export default function NewJobPage() {
  const router = useRouter();

  const [title, setTitle]           = useState("");
  const [department, setDept]       = useState("");
  const [location, setLoc]          = useState("remote");
  const [salaryMin, setSalaryMin]   = useState("");
  const [salaryMax, setSalaryMax]   = useState("");
  const [description, setDesc]      = useState("");
  const [skills, setSkills]         = useState("");
  const [maxApplicants, setMaxApp]  = useState("");
  const [deadline, setDeadline]     = useState("");

  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !department || !description || !skills || !deadline || !salaryMin || !salaryMax) {
      setError("Please fill in all required fields.");
      return;
    }

    if (Number(salaryMin) >= Number(salaryMax)) {
      setError("Salary Min must be less than Salary Max.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        department,
        description,
        location,
        salary_min: Number(salaryMin),
        salary_max: Number(salaryMax),
        required_skills: skills.split(",").map(s => s.trim()).filter(s => s !== ""),
        max_applicants: maxApplicants ? Number(maxApplicants) : null,
        deadline,
      };

      const job = await api.createJob(payload);
      router.push(`/jobs/${job.id}`);
    } catch (e: any) {
      setError(e.detail ?? "Failed to create job listing. Check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <Link href="/" className="back-link">← Back to dashboard</Link>

      <div className="page-header">
        <h1>✨ Post a New Job</h1>
        <p>Create a listing to start receiving applications from top talent.</p>
      </div>

      <div className="detail-card">
        <form onSubmit={handleSubmit} className="job-create-form">
          {error && <p className="form-error">{error}</p>}

          <div className="form-group">
            <label htmlFor="job-title">Job Title *</label>
            <input id="job-title" type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Software Engineer" required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label htmlFor="job-dept">Department *</label>
              <select id="job-dept" className="form-select" value={department} onChange={(e) => setDept(e.target.value)} required>
                <option value="">Select Department...</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="job-loc">Location *</label>
              <select id="job-loc" className="form-select" value={location} onChange={(e) => setLoc(e.target.value)} required>
                {LOCATIONS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label htmlFor="job-salary-min">Salary Min ($) *</label>
              <input id="job-salary-min" type="number" className="form-input" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="60000" required />
            </div>
            <div className="form-group">
              <label htmlFor="job-salary-max">Salary Max ($) *</label>
              <input id="job-salary-max" type="number" className="form-input" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="90000" required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="job-desc">Job Description *</label>
            <textarea id="job-desc" className="form-textarea" style={{ minHeight: "150px" }} value={description} onChange={(e) => setDesc(e.target.value)} placeholder="Describe the role, responsibilities, and team..." required />
          </div>

          <div className="form-group">
            <label htmlFor="job-skills">Required Skills * (comma separated)</label>
            <input id="job-skills" type="text" className="form-input" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, TypeScript, Node.js" required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label htmlFor="job-deadline">Deadline *</label>
              <input id="job-deadline" type="date" className="form-input" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="job-max-app">Max Applicants (optional)</label>
              <input id="job-max-app" type="number" className="form-input" value={maxApplicants} onChange={(e) => setMaxApp(e.target.value)} placeholder="e.g. 50" />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "1rem" }}>
            {loading ? "Creating Listing..." : "Post Job Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}
