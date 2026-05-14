"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchJobs } from "@/lib/api";
import JobCard from "@/components/JobCard";
import PaginationControls from "@/components/PaginationControls";

function HomePageContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [jobs, setJobs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(9);
  const [loading, setLoading] = useState(true);

  // Filters
  // Applied (debounced) filter inputs to avoid rapid fetches and flicker
  const [titleFilter, setTitleFilter] = useState("");
  const [location, setLocation] = useState("");
  const [skill, setSkill] = useState("");
  const [includeClosed, setIncludeClosed] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchQuery);

  // Local input buffers to debounce typing
  const [titleInput, setTitleInput] = useState("");
  const [skillInput, setSkillInput] = useState("");

  async function loadJobs() {
    setLoading(true);
    try {
      const data = await fetchJobs({
        page,
        per_page: perPage,
        search: searchTerm || undefined,
        title: titleFilter || undefined,
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

  // Set search term from URL on mount
  useEffect(() => {
    setSearchTerm(searchQuery || "");
  }, [searchQuery]);

  // Debounce applying typed filters (avoid fetch on every keystroke)
  useEffect(() => {
    const t = setTimeout(() => {
      // Apply buffered inputs to filter state and reset page
      setTitleFilter((prev) => {
        if (prev !== titleInput) {
          setPage(1);
          return titleInput;
        }
        return prev;
      });
      setSkill((prev) => {
        if (prev !== skillInput) {
          setPage(1);
          return skillInput;
        }
        return prev;
      });
    }, 350);
    return () => clearTimeout(t);
  }, [titleInput, skillInput]);

  useEffect(() => {
    loadJobs();
  }, [page, searchTerm, titleFilter, location, skill, includeClosed]);

  function handleLocationChange(val) {
    setLocation(val);
    setPage(1);
  }

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-kicker">Internal hiring platform</span>
          <h1>Browse open roles with a tighter, clearer pipeline.</h1>
          <p>
            Search live listings, filter by job title or skill, and move candidates through the workflow without
            losing audit history. {totalCount} job{totalCount !== 1 ? "s" : ""} currently match your view.
          </p>
          <div className="hero-actions">
            <Link href="/post-job" className="btn btn-secondary">
              Post a job
            </Link>
            <Link href="/dashboard" className="btn btn-primary">
              View dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <div className="filter-bar">
        <input
          className="form-input"
          placeholder="Search by job title..."
          value={titleInput}
          onChange={(e) => { setTitleInput(e.target.value); }}
          id="filter-title"
        />
        <select
          className="form-select"
          value={location}
          onChange={(e) => { handleLocationChange(e.target.value); }}
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
          value={skillInput}
          onChange={(e) => { setSkillInput(e.target.value); }}
          id="filter-skill"
        />
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)", minWidth: "fit-content" }}>
          <input
            type="checkbox"
            checked={includeClosed}
            onChange={(e) => { setIncludeClosed(e.target.checked); setPage(1); }}
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

/**
 * Home page — Job listings with search, filter, and pagination controls.
 * Route: /
 * Wrapped in Suspense to handle useSearchParams() in Next.js 16
 */
export default function HomePage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem 0", textAlign: "center" }}>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
