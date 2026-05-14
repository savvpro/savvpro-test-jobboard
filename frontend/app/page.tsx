"use client";

import { useEffect, useState } from "react";
import { Search, MapPin, Briefcase, Filter } from "lucide-react";
import { JobCard } from "@/components/JobCard";
import { PaginationControls } from "@/components/PaginationControls";

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  salary_min: number;
  salary_max: number;
  deadline: string;
  required_skills: string[];
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    department: "",
    location: "",
    skill: ""
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: "6",
        ...(filters.department && { department: filters.department }),
        ...(filters.location && { location: filters.location }),
        ...(filters.skill && { skill: filters.skill }),
      });
      const res = await fetch(`/api/jobs?${params}`);
      const data = await res.json();
      setJobs(data.results);
      setTotalPages(Math.ceil(data.total_count / data.per_page));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, filters]);

  return (
    <div className="space-y-8">
      <div className="text-center py-12 space-y-4">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          Find your next <span className="text-primary-600">dream role</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore opportunities at the forefront of innovation. Browse our latest job listings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-2xl border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Skill (e.g. Python)"
            className="w-full pl-10 pr-4 py-2 bg-background border rounded-xl focus:ring-2 ring-primary-500 outline-none transition-all"
            value={filters.skill}
            onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
          />
        </div>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <select
            className="w-full pl-10 pr-4 py-2 bg-background border rounded-xl focus:ring-2 ring-primary-500 outline-none transition-all appearance-none"
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
          >
            <option value="">All Departments</option>
            {["Engineering", "Product", "Design", "Marketing"].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <select
            className="w-full pl-10 pr-4 py-2 bg-background border rounded-xl focus:ring-2 ring-primary-500 outline-none transition-all appearance-none"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          >
            <option value="">All Locations</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>
        </div>
        <button 
          onClick={() => {setPage(1); fetchJobs();}}
          className="flex items-center justify-center gap-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          <Filter className="h-4 w-4" />
          Apply Filters
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl border" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
