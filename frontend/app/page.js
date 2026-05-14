"use client";

import { useState, useEffect } from "react";
import { fetchJobs } from "@/lib/api";
import JobCard from "@/components/JobCard";
import PaginationControls from "@/components/PaginationControls";

/**
 * Home page — Job listings with search, filter, and pagination controls.
 * Route: /
 */
export default function HomePage() {
  const [jobs, setJobs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(9);
  const [loading, setLoading] = useState(true);

  // Filters
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [skill, setSkill] = useState("");
  const [includeClosed, setIncludeClosed] = useState(false);

  async function loadJobs() {
    setLoading(true);
    try {
      const data = await fetchJobs({
        page,
        per_page: perPage,
        department: department || undefined,
        location: location || undefined,
        skill: skill || undefined,
        include_closed: includeClosed || undefined,
      });
      setJobs(data.results);
      setTotalCount(data.total_count);
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, [page, department, location, skill, includeClosed]);

  function handleFilterChange() {
    setPage(1);
  }

  return (
    <>
      <div className="page-header">
        <h1>Open Positions</h1>
        <p>Find your next opportunity — browse {totalCount} job{totalCount !== 1 ? "s" : ""}</p>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <input
          className="form-input"
          placeholder="Filter by department..."
          value={department}
          onChange={(e) => { setDepartment(e.target.value); handleFilterChange(); }}
          id="filter-department"
        />
        <select
          className="form-select"
          value={location}
          onChange={(e) => { setLocation(e.target.value); handleFilterChange(); }}
          id="filter-location"
        >
          <option value="">All Locations</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">Onsite</option>
        </select>
        <input
          className="form-input"
          placeholder="Filter by skill..."
          value={skill}
          onChange={(e) => { setSkill(e.target.value); handleFilterChange(); }}
          id="filter-skill"
        />
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)", minWidth: "fit-content" }}>
          <input
            type="checkbox"
            checked={includeClosed}
            onChange={(e) => { setIncludeClosed(e.target.checked); handleFilterChange(); }}
          />
          Include closed
        </label>
      </div>

      {/* Job grid */}
      {loading ? (
        <div className="jobs-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: "220px" }} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-secondary)" }}>
          <p style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>No jobs found</p>
          <p>Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <PaginationControls
        page={page}
        perPage={perPage}
        totalCount={totalCount}
        onPageChange={setPage}
      />
    </>
  );
}
