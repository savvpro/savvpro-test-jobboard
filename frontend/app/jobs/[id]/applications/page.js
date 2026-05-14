"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchJob, fetchApplications } from "@/lib/api";
import ApplicationRow from "@/components/ApplicationRow";
import StatusBadge from "@/components/StatusBadge";

/**
 * Applications Pipeline page — View and manage applications for a job.
 * Route: /jobs/[id]/applications
 */
export default function ApplicationsPage() {
  const params = useParams();
  const jobId = params.id;

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [jobData, appsData] = await Promise.all([
        fetchJob(jobId),
        fetchApplications(jobId, statusFilter || undefined),
      ]);
      setJob(jobData);
      setApplications(appsData);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (jobId) load();
  }, [jobId, statusFilter]);

  // Counts by status
  const counts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  if (loading && !job) {
    return (
      <div style={{ padding: "2rem 0" }}>
        <div className="skeleton" style={{ height: "40px", width: "50%", marginBottom: "1rem" }} />
        <div className="skeleton" style={{ height: "300px" }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ padding: "1.5rem 0 0.5rem" }}>
        <Link href={`/jobs/${jobId}`} className="text-link">← Back to {job?.title || "Job"}</Link>
      </div>

      <div className="page-header" style={{ paddingTop: "0.5rem" }}>
        <h1>Applications Pipeline</h1>
        <p>
          {job?.title} — {job?.department} <StatusBadge status={job?.status} />
        </p>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        {["", "pending", "shortlisted", "offered", "rejected"].map((s) => (
          <button
            key={s}
            className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setStatusFilter(s)}
          >
            {s || "All"} {s && counts[s] ? `(${counts[s]})` : s ? "(0)" : `(${applications.length})`}
          </button>
        ))}
      </div>

      {applications.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-secondary)" }}>
          <p style={{ fontSize: "1.125rem" }}>No applications {statusFilter ? `with status "${statusFilter}"` : "yet"}</p>
        </div>
      ) : (
        <div className="card table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Experience</th>
                <th>Status</th>
                <th>Applied</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <ApplicationRow
                  key={app.id}
                  application={app}
                  onStatusUpdated={load}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
