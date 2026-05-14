"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchJobs } from "@/lib/api";

export default function ApplicationsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs({ per_page: 50, include_closed: true })
      .then((data) => setJobs(data.results || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: "2rem 0" }}>Loading pipelines...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: "2rem", paddingTop: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "#1e293b" }}>Applications Pipeline</h1>
        <p style={{ margin: "0.25rem 0 0 0", color: "#64748b" }}>Select a job listing to view its active applications and manage candidates.</p>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "0.75rem", border: "1px solid #e2e8f0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ color: "#64748b", textAlign: "left", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
              <th style={{ padding: "1rem", fontWeight: 500 }}>Job Role</th>
              <th style={{ padding: "1rem", fontWeight: 500 }}>Department</th>
              <th style={{ padding: "1rem", fontWeight: 500 }}>Status</th>
              <th style={{ padding: "1rem", fontWeight: 500 }}>Applications</th>
              <th style={{ padding: "1rem", fontWeight: 500, textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>No job listings found.</td>
              </tr>
            ) : (
              jobs.map(job => (
                <tr key={job.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "1rem", fontWeight: 600, color: "#1e293b" }}>{job.title}</td>
                  <td style={{ padding: "1rem", color: "#64748b" }}>{job.department}</td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{ 
                      backgroundColor: job.status === "open" ? "#dcfce7" : "#f1f5f9", 
                      color: job.status === "open" ? "#16a34a" : "#64748b", 
                      padding: "0.25rem 0.5rem", 
                      borderRadius: "9999px", 
                      fontSize: "0.75rem", 
                      fontWeight: 500 
                    }}>
                      {job.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", color: "#1e293b", fontWeight: 600 }}>{job.application_count}</td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    <Link href={`/jobs/${job.id}/applications`}>
                      <button style={{ backgroundColor: "white", color: "#1e293b", padding: "0.375rem 0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.375rem", fontWeight: 500, cursor: "pointer", fontSize: "0.75rem" }}>
                        View Pipeline
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
