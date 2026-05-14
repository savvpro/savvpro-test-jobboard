"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { getJobs, JobSearchParams, JobListResponse } from "@/lib/api";
import JobCard from "@/components/JobCard";
import FilterBar from "@/components/FilterBar";
import PaginationControls from "@/components/PaginationControls";
import { SearchX } from "lucide-react";

export default function Home() {
  const [data, setData] = useState<JobListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<JobSearchParams>({ page: 1, per_page: 9 });
  
  // Hardcoded for now. In a real app we might fetch distinct departments from an endpoint.
  const allDepartments = useMemo(() => ["Engineering", "Design", "Product", "Marketing", "Sales", "Operations"], []);

  const fetchJobs = useCallback(async (p: JobSearchParams) => {
    setLoading(true);
    try {
      const res = await getJobs(p);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(params);
  }, [params, fetchJobs]);

  const handleFilter = useCallback((filters: { department?: string; location?: string; search?: string }) => {
    setParams(prev => ({ ...prev, ...filters, page: 1 }));
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setParams(prev => ({ ...prev, page: newPage }));
  }, []);

  return (
    <main className="animate-fade-up">
      <div className="py-16 md:py-24">
        <h1 className="text-[56px] font-bold leading-[1.07] tracking-[-2px] text-textPrimary mb-4">
          Open Roles
        </h1>
        <p className="text-[28px] leading-[1.2] tracking-[-0.5px] text-textSecondary max-w-[600px]">
          We&apos;re building something exceptional. <br/>Join us.
        </p>
      </div>

      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
        <FilterBar onFilter={handleFilter} departments={allDepartments} />
        {data && (
          <div className="text-[14px] text-textSecondary shrink-0 font-medium">
            {data.total_count} {data.total_count === 1 ? 'Job' : 'Jobs'}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-border rounded-[18px] p-6 h-[260px] animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="w-20 h-5 bg-surface rounded-md"></div>
                <div className="w-16 h-5 bg-surface rounded-md"></div>
              </div>
              <div className="w-3/4 h-6 bg-surface rounded-md mb-4"></div>
              <div className="w-1/2 h-5 bg-surface rounded-md mb-6"></div>
              <div className="flex gap-2">
                <div className="w-16 h-6 bg-surface rounded-md"></div>
                <div className="w-16 h-6 bg-surface rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      ) : data?.results.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 text-textTertiary">
            <SearchX size={32} />
          </div>
          <h3 className="text-[20px] font-semibold tracking-[-0.3px] text-textPrimary mb-2">
            No open positions match your search
          </h3>
          <p className="text-[15px] text-textSecondary max-w-[400px] mb-6">
            Try adjusting your filters or expanding your search criteria to find available roles.
          </p>
          <button 
            onClick={() => handleFilter({ department: undefined, location: undefined, search: undefined })}
            className="text-accent font-medium hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data?.results.map((job, idx) => (
            <div key={job.id} style={{ animationDelay: `${idx * 60}ms` }} className="animate-fade-up opacity-0">
               <JobCard job={job} />
            </div>
          ))}
        </div>
      )}

      {data && (
        <PaginationControls 
          page={data.page} 
          perPage={data.per_page} 
          totalCount={data.total_count} 
          onPageChange={handlePageChange} 
        />
      )}
    </main>
  );
}