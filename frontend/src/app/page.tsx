"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FilterBar, JobCard, PaginationControls } from "@/components";
import { fetchJobs } from "@/lib/api";
import type { JobResponse } from "@/types/job";

const PER_PAGE = 6;

function getStatus(isClosed: boolean, deadline: string) {
  const deadlineDate = new Date(deadline);
  const isExpired = deadlineDate < new Date();
  return isClosed || isExpired ? "Closed" : "Open";
}

export default function Home() {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadJobs() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchJobs(currentPage, PER_PAGE, false, departmentFilter, locationFilter);
        if (!isMounted) return;

        setJobs(data.results);
        setDepartments(Array.from(new Set(data.results.map((job) => job.department))).sort());
        setLocations(Array.from(new Set(data.results.map((job) => job.location))).sort());
        setTotalPages(Math.max(1, Math.ceil(data.total_count / data.per_page)));
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Unable to load jobs.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadJobs();

    return () => {
      isMounted = false;
    };
  }, [currentPage, departmentFilter, locationFilter]);

  function resetFilters() {
    setDepartmentFilter("");
    setLocationFilter("");
    setCurrentPage(1);
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-10 text-slate-950 dark:bg-zinc-950 dark:text-zinc-50">
      <main className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-white/90 p-8 shadow-sm shadow-zinc-200/50 dark:bg-zinc-950/80 dark:shadow-black/20">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">
                  Live API job board
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                  Browse jobs from the backend
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                  This page connects the Next.js frontend to the FastAPI backend using the Fetch API. Jobs are loaded from `/api/jobs` and displayed with reusable Tailwind components.
                </p>
              </div>
              <Link
                href="/job/create"
                className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-zinc-200"
              >
                Create Job
              </Link>
            </div>
          </div>
        </section>

        <FilterBar
          department={departmentFilter}
          location={locationFilter}
          departments={departments}
          locations={locations}
          onDepartmentChange={(value) => {
            setDepartmentFilter(value);
            setCurrentPage(1);
          }}
          onLocationChange={(value) => {
            setLocationFilter(value);
            setCurrentPage(1);
          }}
          onReset={resetFilters}
        />

        <section className="space-y-6">
          {loading ? (
            <div className="rounded-3xl border border-dashed border-zinc-300 bg-white/90 p-10 text-center text-slate-600 dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-slate-300">
              Loading jobs...
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/80 dark:text-rose-200">
              {error}
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 bg-white/90 p-10 text-center text-slate-600 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-slate-300">
              No jobs found.
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  jobId={job.id}
                  title={job.title}
                  department={job.department}
                  location={job.location}
                  salaryRange={`$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`}
                  description={job.description}
                  status={getStatus(job.is_closed, job.deadline)}
                  deadline={job.deadline}
                  maxApplicants={job.max_applicants}
                  requiredSkills={job.required_skills}
                />
              ))}
            </div>
          )}
        </section>

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          className="justify-center"
        />
      </main>
    </div>
  );
}
