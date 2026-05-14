"use client";

import { useState, useEffect } from "react";
import { fetchStats } from "@/lib/api";

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
    return <div style={{ padding: "2rem 0" }}>Loading dashboard...</div>;
  }

  if (!stats) return null;

  return (
    <div>
      <div className="dashboard-header">
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "#1e293b" }}>Executive Dashboard</h1>
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div className="dashboard-kpi-card dashboard-kpi-1">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Total Jobs</div>
            <div style={{ backgroundColor: "#f1f5f9", padding: "0.25rem", borderRadius: "0.25rem" }}><span className="material-symbols-outlined" style={{ fontSize: "1rem", color: "#1e293b" }}>work_outline</span></div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "1rem" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#1e293b" }}>{stats.total_jobs}</div>
            <div style={{ fontSize: "0.75rem", color: "#22c55e", fontWeight: 600 }}>↑ 12%</div>
          </div>
        </div>

        <div className="dashboard-kpi-card dashboard-kpi-2">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Active Applications</div>
            <div style={{ backgroundColor: "#f1f5f9", padding: "0.25rem", borderRadius: "0.25rem" }}><span className="material-symbols-outlined" style={{ fontSize: "1rem", color: "#64748b" }}>people_outline</span></div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "1rem" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#1e293b" }}>{stats.total_applications}</div>
            <div style={{ fontSize: "0.75rem", color: "#22c55e", fontWeight: 600 }}>↑ 8%</div>
          </div>
        </div>

        <div className="dashboard-kpi-card dashboard-kpi-3">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Open Jobs</div>
            <div style={{ backgroundColor: "#dcfce7", padding: "0.25rem", borderRadius: "0.25rem" }}><span className="material-symbols-outlined" style={{ fontSize: "1rem", color: "#22c55e" }}>check_circle</span></div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "1rem" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#1e293b" }}>{stats.open_jobs}</div>
            <div style={{ fontSize: "0.75rem", color: "#22c55e", fontWeight: 600 }}>Active</div>
          </div>
        </div>

        <div className="dashboard-kpi-card dashboard-kpi-4">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Avg Apps / Job</div>
            <div style={{ backgroundColor: "#f1f5f9", padding: "0.25rem", borderRadius: "0.25rem" }}><span className="material-symbols-outlined" style={{ fontSize: "1rem", color: "#1e293b" }}>analytics</span></div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "1rem" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#1e293b" }}>{(Math.round(stats.avg_applications_per_job * 10) / 10).toFixed(1)}</div>
            <div style={{ fontSize: "0.75rem", color: "#22c55e", fontWeight: 600 }}>Per role</div>
          </div>
        </div>
      </section>

      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ flex: "2 1 600px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div className="dashboard-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 600, color: "#1e293b" }}>Application Trends</h3>
                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "#64748b" }}>Candidate volume over the last 30 days</p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", backgroundColor: "#f1f5f9", padding: "0.25rem", borderRadius: "0.5rem" }}>
                <button style={{ padding: "0.25rem 0.75rem", border: "none", backgroundColor: "transparent", color: "#64748b", fontSize: "0.75rem", fontWeight: 500, borderRadius: "0.25rem" }}>Monthly</button>
                <button style={{ padding: "0.25rem 0.75rem", border: "none", backgroundColor: "#1e293b", color: "white", fontSize: "0.75rem", fontWeight: 500, borderRadius: "0.25rem" }}>Weekly</button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", height: "200px", gap: "0.5rem", paddingBottom: "1rem" }}>
              {(stats.application_trends || []).map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${Math.min(100, Math.max(10, (h / Math.max(1, ...stats.application_trends)) * 100))}%`, backgroundColor: i === stats.application_trends.length - 1 ? "#1e293b" : "#cbd5e1", borderRadius: "0.25rem 0.25rem 0 0" }} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b", marginTop: "0.5rem" }}>
              <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span>
            </div>
          </div>

          <div className="dashboard-card">
            <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.125rem", fontWeight: 600, color: "#1e293b" }}>Top Departments</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ color: "#64748b", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ paddingBottom: "0.75rem", fontWeight: 500 }}>Department</th>
                  <th style={{ paddingBottom: "0.75rem", fontWeight: 500 }}>Open Roles</th>
                  <th style={{ paddingBottom: "0.75rem", fontWeight: 500 }}>Avg. Applicants</th>
                  <th style={{ paddingBottom: "0.75rem", fontWeight: 500, textAlign: "right" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "1rem 0", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: "4px", height: "16px", backgroundColor: "#1e293b", borderRadius: "2px" }} />
                    <span style={{ fontWeight: 600, color: "#1e293b" }}>{stats.top_department || "Engineering"}</span>
                  </td>
                  <td style={{ padding: "1rem 0", borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>{stats.open_jobs}</td>
                  <td style={{ padding: "1rem 0", borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>{Math.round(stats.avg_applications_per_job)}</td>
                  <td style={{ padding: "1rem 0", borderBottom: "1px solid #e2e8f0", textAlign: "right" }}>
                    <span style={{ backgroundColor: "#dcfce7", color: "#16a34a", padding: "0.25rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500 }}>High Priority</span>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>

        <div style={{ flex: "1 1 300px" }}>
          <div className="dashboard-card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.125rem", fontWeight: 600, color: "#1e293b" }}>Recent Activity</h3>
            
            <div style={{ flex: 1 }}>
              {(stats.recent_activity || []).length > 0 ? (
                stats.recent_activity.map((activity, idx) => (
                  <div key={idx} className="activity-item">
                    <div className="activity-icon" style={{ border: `2px solid ${activity.color}` }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "12px", color: activity.color }}>{activity.icon}</span>
                    </div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1e293b" }}>{activity.title}</div>
                    <div style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "0.25rem" }} dangerouslySetInnerHTML={{ __html: activity.description.replace(/for (.*?)(\.|$)/, 'for <span style="font-weight: 600; color: #1e293b">$1</span>$2') }} />
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.5rem" }}>{activity.time_str}</div>
                  </div>
                ))
              ) : (
                <div style={{ color: "#64748b", fontSize: "0.875rem" }}>No recent activity.</div>
              )}
            </div>

            <button style={{ width: "100%", padding: "0.75rem", backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "0.5rem", color: "#1e293b", fontWeight: 500, fontSize: "0.875rem", marginTop: "1rem", cursor: "pointer" }}>
              View All Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
