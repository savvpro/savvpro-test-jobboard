"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getJob, Job, getApplications, Application, closeJob, StatusEnum } from "@/lib/api";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import ApplicationRow from "@/components/ApplicationRow";

export default function Applications() {
  const params = useParams();
  
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<StatusEnum | "all">("all");

  const [closing, setClosing] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const j = await getJob(Number(params.id));
        setJob(j);
        
        const apps = await getApplications(Number(params.id), activeTab === "all" ? undefined : activeTab);
        setApplications(apps);
        setError(false);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.id, activeTab]);

  const handleStatusUpdate = async (appId: number, status: StatusEnum, note: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/applications/${appId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      const newApp: Application = await res.json();
      // Remove it from the current filter if we're filtering by a specific status,
      // or update it in place if we're on "all"
      if (activeTab !== "all" && newApp.status !== activeTab) {
        setApplications(prev => prev.filter(a => a.id !== appId));
      } else {
        setApplications(prev => prev.map(a => a.id === appId ? newApp : a));
      }
    } catch (err) {
      throw err;
    }
  };

  const handleCloseJob = async () => {
    setClosing(true);
    try {
      if (job) {
        const updatedJob = await closeJob(job.id);
        setJob(updatedJob);
        setShowCloseConfirm(false);
        // Refresh applications to see those auto-rejected
        const apps = await getApplications(Number(params.id), activeTab === "all" ? undefined : activeTab);
        setApplications(apps);
      }
    } catch {
      alert("Failed to close job");
    } finally {
      setClosing(false);
    }
  };

  if (loading && !job) {
    return (
      <main className="py-12 max-w-[1120px] mx-auto animate-pulse px-6">
        <div className="w-48 h-10 bg-surface rounded-md mb-2" />
        <div className="w-32 h-6 bg-surface rounded-md mb-12" />
        <div className="flex gap-2 mb-8">
          <div className="w-20 h-8 bg-surface rounded-full" />
          <div className="w-20 h-8 bg-surface rounded-full" />
        </div>
        <div className="space-y-4">
          <div className="w-full h-20 bg-surface rounded-xl" />
          <div className="w-full h-20 bg-surface rounded-xl" />
        </div>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="py-24 text-center">
        <h2 className="text-[28px] font-bold text-textPrimary mb-2">Error Loading Data</h2>
        <p className="text-[17px] text-textSecondary mb-6">Failed to load the pipeline for this job.</p>
        <Link href="/" className="text-accent hover:underline font-medium">
          Return to open roles
        </Link>
      </main>
    );
  }

  const tabs: { id: StatusEnum | "all", label: string }[] = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "shortlisted", label: "Shortlisted" },
    { id: "offered", label: "Offered" },
    { id: "rejected", label: "Rejected" },
  ];

  return (
    <main className="py-8 md:py-12 max-w-[1120px] mx-auto px-6 animate-fade-up">
      <Link href={`/jobs/${job.id}`} className="inline-flex items-center gap-1.5 text-textSecondary hover:text-textPrimary text-[14px] font-medium transition-colors mb-8">
        <ArrowLeft size={16} />
        Back to Job Detail
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <div>
          <h1 className="text-[40px] leading-[1.1] font-bold tracking-[-1.5px] text-textPrimary mb-2">
            Applications Pipeline
          </h1>
          <div className="text-[17px] text-textSecondary font-medium">
            {job.title} <span className="mx-2">·</span> <span className="capitalize">{job.department}</span>
          </div>
        </div>

        {!job.is_closed && (
          <div className="relative">
            {!showCloseConfirm ? (
              <button 
                onClick={() => setShowCloseConfirm(true)}
                className="text-[14px] font-semibold text-danger hover:bg-danger/10 px-4 py-2 rounded-md transition-colors border border-transparent hover:border-danger/20"
              >
                Close This Job
              </button>
            ) : (
              <div className="bg-white border text-left border-border shadow-[0_8px_24px_rgba(0,0,0,0.12)] rounded-xl p-5 min-w-[300px] z-10 animate-fade-up">
                <div className="flex items-start gap-3 mb-4 text-textPrimary font-semibold text-[15px] leading-tight">
                  <AlertTriangle size={18} className="text-danger shrink-0 mt-0.5" />
                  Are you sure? This will reject all pending applications instantly.
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <button 
                    onClick={() => setShowCloseConfirm(false)}
                    className="text-[14px] font-medium text-textSecondary hover:text-textPrimary px-3 py-1.5"
                    disabled={closing}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCloseJob}
                    disabled={closing}
                    className="bg-danger text-white text-[14px] font-medium px-4 py-2 rounded-lg hover:bg-[#D92D20] active:scale-[0.98] transition-all"
                  >
                    {closing ? 'Closing...' : 'Close Job'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-full text-[14px] font-medium transition-colors ${
              activeTab === tab.id 
                ? 'bg-accent text-white shadow-sm'
                : 'bg-surface text-textSecondary hover:text-textPrimary hover:bg-surface2'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
             <div className="flex justify-center items-center py-24">
               <div className="w-8 h-8 rounded-full border-2 border-border border-t-accent animate-spin" />
             </div>
        ) : applications.length > 0 ? (
          applications.map(app => (
            <ApplicationRow 
              key={app.id} 
              application={app} 
              onStatusUpdate={handleStatusUpdate} 
            />
          ))
        ) : (
          <div className="text-center py-20 bg-surface rounded-2xl border border-border border-dashed">
            <h3 className="text-[17px] font-semibold text-textPrimary mb-2">No applications found</h3>
            <p className="text-[15px] text-textSecondary">
              There are no applications matching the &quot;{tabs.find(t => t.id === activeTab)?.label}&quot; filter.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}