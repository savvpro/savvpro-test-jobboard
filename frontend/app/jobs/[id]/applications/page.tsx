"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, Application, Job } from "@/lib/api";
import ApplicationRow from "@/components/ApplicationRow";

const STATUS_TABS = ["all", "pending", "shortlisted", "offered", "rejected"];

export default function ApplicationsPipelinePage() {
  const { id } = useParams<{ id: string }>();
  const jobId = Number(id);

  const [job, setJob]                     = useState<Job | null>(null);
  const [applications, setApplications]   = useState<Application[]>([]);
  const [activeStatus, setActiveStatus]   = useState("all");
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [jobData, appsData] = await Promise.all([
        api.getJob(jobId),
        api.getApplications(jobId, activeStatus === "all" ? undefined : activeStatus),
      ]);
      setJob(jobData);
      setApplications(appsData);
    } catch {
      setError("Failed to load pipeline. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, [jobId, activeStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusUpdate = (updated: Application) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    );
  };

  const counts = applications.reduce<Record<string, number>>((acc, a) => {
    acc[a.current_status] = (acc[a.current_status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <Link href={`/jobs/${jobId}`} className="back-link">← Back to job</Link>

      <div className="page-header">
        <h1>📂 Applications Pipeline</h1>
        {job && <p>{job.title} · {job.department}</p>}
      </div>

      <div className="pipeline-header">
        <div className="status-filter-tabs">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              id={`tab-${s}`}
              className={`tab-btn ${activeStatus === s ? "active" : ""}`}
              onClick={() => setActiveStatus(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {s !== "all" && counts[s] !== undefined && (
                <span style={{ marginLeft: "0.35rem", opacity: 0.75 }}>
                  ({counts[s]})
                </span>
              )}
              {s === "all" && (
                <span style={{ marginLeft: "0.35rem", opacity: 0.75 }}>
                  ({applications.length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton-card" style={{ height: 72, borderRadius: 10 }} />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p>No applications {activeStatus !== "all" ? `with status "${activeStatus}"` : "yet"}.</p>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map((app) => (
            <ApplicationRow
              key={app.id}
              application={app}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}
    </>
  );
}
