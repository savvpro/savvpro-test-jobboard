"use client";

import { useState, useEffect } from "react";
import { fetchStats } from "@/lib/api";

/**
 * Dashboard page — Analytics dashboard consuming the /api/stats endpoint.
 * Route: /dashboard
 */
export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch((err) => console.error("Failed to load stats:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem 0" }}>
        <div className="skeleton" style={{ height: "40px", width: "40%", marginBottom: "2rem" }} />
        <div className="stats-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: "120px" }} />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: "4rem 0", textAlign: "center", color: "var(--text-secondary)" }}>
        <p>Failed to load analytics. Make sure the backend is running.</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Jobs", value: stats.total_jobs, icon: "📋" },
    { label: "Open Jobs", value: stats.open_jobs, icon: "🟢" },
    { label: "Closed Jobs", value: stats.closed_jobs, icon: "🔴" },
    { label: "Total Applications", value: stats.total_applications, icon: "📝" },
    { label: "Avg. Applications/Job", value: stats.avg_applications_per_job, icon: "📊" },
    { label: "Top Department", value: stats.top_department || "—", icon: "🏢" },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Analytics Dashboard</h1>
        <p>Live platform metrics — computed from the database in real-time</p>
      </div>

      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card" id={`stat-${card.label.toLowerCase().replace(/[\s/.]/g, "-")}`}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{card.icon}</div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Visual breakdown */}
      <div style={{ marginTop: "2rem" }}>
        <div className="card">
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginTop: 0 }}>Platform Overview</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "1rem" }}>
            <div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: "0 0 0.5rem" }}>
                Job Status Distribution
              </p>
              <div style={{ display: "flex", height: "8px", borderRadius: "4px", overflow: "hidden", background: "var(--bg-dark)" }}>
                {stats.total_jobs > 0 && (
                  <>
                    <div style={{
                      width: `${(stats.open_jobs / stats.total_jobs) * 100}%`,
                      background: "var(--success)",
                      transition: "width 0.5s ease",
                    }} />
                    <div style={{
                      width: `${(stats.closed_jobs / stats.total_jobs) * 100}%`,
                      background: "var(--error)",
                      transition: "width 0.5s ease",
                    }} />
                  </>
                )}
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                <span>🟢 Open: {stats.open_jobs}</span>
                <span>🔴 Closed: {stats.closed_jobs}</span>
              </div>
            </div>
            <div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: "0 0 0.5rem" }}>
                Hiring Activity
              </p>
              <p style={{ fontSize: "2rem", fontWeight: 700, margin: 0, color: "var(--accent)" }}>
                {stats.avg_applications_per_job}
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0.25rem 0 0" }}>
                average applications per job posting
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
