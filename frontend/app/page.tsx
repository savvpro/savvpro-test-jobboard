"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, Job, JobListResponse } from "@/lib/api";
import JobCard from "@/components/JobCard";
import PaginationControls from "@/components/PaginationControls";

const DEPARTMENTS = ["Engineering", "Marketing", "Sales", "Data", "Design", "Product", "HR", "Finance", "Operations"];
const LOCATIONS = ["remote", "hybrid", "onsite"];

export default function HomePage() {
  const router = useRouter();

  const [data, setData]             = useState<JobListResponse | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  const [search, setSearch]         = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation]     = useState("");
  const [skill, setSkill]           = useState("");
  const [page, setPage]             = useState(1);
  const PER_PAGE = 9;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api.getJobs({
        ...(department ? { department } : {}),
        ...(location   ? { location }   : {}),
        ...(skill      ? { skill }      : {}),
        page,
        per_page: PER_PAGE,
      });
      // Client-side title/description filter for search bar
      if (search.trim()) {
        const q = search.toLowerCase();
        result.results = result.results.filter(
          (j) =>
            j.title.toLowerCase().includes(q) ||
            j.description.toLowerCase().includes(q) ||
            j.department.toLowerCase().includes(q)
        );
        result.total_count = result.results.length;
      }
      setData(result);
    } catch {
      setError("Failed to load jobs. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, [search, department, location, skill, page]);

  useEffect(() => {
    setPage(1);
  }, [search, department, location, skill]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const clearFilters = () => {
    setSearch(""); setDepartment(""); setLocation(""); setSkill(""); setPage(1);
  };

  const hasFilters = search || department || location || skill;

  return (
    <>
      <div className="page-header">
        <h1>🚀 Open Positions</h1>
        <p>Browse and apply to open roles across all departments.</p>
      </div>

      <div className="search-bar-wrapper">
        <div className="search-group" style={{ flex: 2, minWidth: 220 }}>
          <label htmlFor="search-input">Search</label>
          <input
            id="search-input"
            type="text"
            className="search-input"
            placeholder="Job title, description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="search-group">
          <label htmlFor="department-filter">Department</label>
          <select
            id="department-filter"
            className="filter-select"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">All departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="search-group">
          <label htmlFor="location-filter">Location</label>
          <select
            id="location-filter"
            className="filter-select"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">All locations</option>
            {LOCATIONS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
          </select>
        </div>

        <div className="search-group">
          <label htmlFor="skill-filter">Skill</label>
          <input
            id="skill-filter"
            type="text"
            className="search-input"
            placeholder="e.g. Python"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
          />
        </div>

        {hasFilters && (
          <button id="clear-filters-btn" className="btn-clear" onClick={clearFilters}>
            ✕ Clear
          </button>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}

      {!loading && data && (
        <p className="results-meta">
          {data.total_count} job{data.total_count !== 1 ? "s" : ""} found
          {hasFilters ? " matching your filters" : ""}
        </p>
      )}

      {loading ? (
        <div className="loading-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      ) : (
        <div className="jobs-grid">
          {data?.results.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p>No jobs found matching your criteria.</p>
              {hasFilters && (
                <button className="btn-clear" onClick={clearFilters} style={{ marginTop: "1rem" }}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            data?.results.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onClick={() => router.push(`/jobs/${job.id}`)}
              />
            ))
          )}
        </div>
      )}

      {data && data.total_count > PER_PAGE && (
        <PaginationControls
          page={page}
          perPage={PER_PAGE}
          totalCount={data.total_count}
          onPageChange={setPage}
        />
      )}
    </>
  );
}
