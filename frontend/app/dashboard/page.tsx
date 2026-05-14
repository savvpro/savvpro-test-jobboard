"use client";

import { useEffect, useState } from "react";
import { api, Stats } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    api.getStats()
      .then(setStats)
      .catch(() => setError("Failed to load stats. Make sure the backend is running."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <div className="page-header">
          <h1>📊 Analytics Dashboard</h1>
          <p>Live hiring metrics from the database.</p>
        </div>
        <div className="stats-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card" style={{ height: 110 }} />
          ))}
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="page-header"><h1>📊 Analytics Dashboard</h1></div>
        <p className="form-error">{error}</p>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1>📊 Analytics Dashboard</h1>
        <p>Live hiring metrics computed from the database — refreshed on every visit.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Jobs</span>
          <span className="stat-value accent">{stats?.total_jobs ?? 0}</span>
          <span className="stat-sub">All listings ever posted</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Open Jobs</span>
          <span className="stat-value success">{stats?.open_jobs ?? 0}</span>
          <span className="stat-sub">Active, non-expired listings</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Closed / Expired</span>
          <span className="stat-value error">{stats?.closed_jobs ?? 0}</span>
          <span className="stat-sub">Closed or past deadline</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Applications</span>
          <span className="stat-value accent">{stats?.total_applications ?? 0}</span>
          <span className="stat-sub">Across all listings</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg. Applications</span>
          <span className="stat-value warning">
            {(stats?.avg_applications_per_job ?? 0).toFixed(2)}
          </span>
          <span className="stat-sub">Per job listing</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Top Department</span>
          <span
            className="stat-value accent"
            style={{ fontSize: "1.3rem", letterSpacing: "-0.3px" }}
          >
            {stats?.top_department ?? "—"}
          </span>
          <span className="stat-sub">Most open roles</span>
        </div>
      </div>

      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "1.5rem",
          color: "var(--text-secondary)",
          fontSize: "0.875rem",
          lineHeight: 1.7,
        }}
      >
        <strong style={{ color: "var(--text-primary)" }}>ℹ️ About this dashboard</strong>
        <p style={{ marginTop: "0.5rem" }}>
          All metrics are computed live from the SQLite database on every request.
          Open jobs are defined as listings where <code>is_closed = false</code> and{" "}
          <code>deadline ≥ today</code>. Closed jobs include manually closed listings
          and those past deadline. The top department is the one with the most currently
          open roles.
        </p>
      </div>
    </>
  );
}
