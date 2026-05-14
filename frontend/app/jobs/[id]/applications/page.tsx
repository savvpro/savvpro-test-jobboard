"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ApplicationDetails } from "@/components/ApplicationDetails";
import { ApplicationRow } from "@/components/ApplicationRow";
import { Application, HistoryEvent } from "@/types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ApplicationPipeline() {
  const { id } = useParams();
  const [jobTitle, setJobTitle] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [note, setNote] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchApplications = async () => {
    try {
      const res = await fetch(`/api/jobs/${id}/applications${statusFilter ? `?status=${statusFilter}` : ""}`);
      const data = await res.json();
      if (res.ok) setApplications(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const fetchJob = async () => {
      const res = await fetch(`/api/jobs/${id}`);
      const data = await res.json();
      setJobTitle(data.title);
    };
    fetchJob();
    fetchApplications();
    setLoading(false);
  }, [id, statusFilter]);

  const updateStatus = async (appId: number, newStatus: string) => {
    if (!note) return alert("A note is required for all status changes.");
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_status: newStatus, note }),
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      setNote(""); fetchApplications();
      if (selectedApp?.id === appId) {
        setSelectedApp(prev => prev ? { ...prev, status: newStatus as any } : null);
        fetchHistory(appId);
      }
    } catch (err: any) { alert(err.message); }
  };

  const fetchHistory = async (appId: number) => {
    try {
      const res = await fetch(`/api/applications/${appId}`);
      const data = await res.json();
      setHistory(data.history); setShowHistory(true);
    } catch (err) { console.error(err); }
  };

  const closeJob = async () => {
    if (!confirm("Are you sure you want to close this job? All pending applications will be rejected.")) return;
    try {
      await fetch(`/api/jobs/${id}/close`, { method: "POST" });
      fetchApplications();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link href={`/jobs/${id}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary-600">
            <ArrowLeft className="h-4 w-4" /> Back to Job
          </Link>
          <h1 className="text-3xl font-extrabold">{jobTitle} — Applicants</h1>
        </div>
        <div className="flex gap-2">
          <select className="p-2 border rounded-lg text-sm bg-background" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {["pending", "shortlisted", "offered", "rejected"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <button onClick={closeJob} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors">Close Job</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={cn("lg:col-span-8", selectedApp ? "lg:col-span-7" : "lg:col-span-12")}>
          <div className="bg-background border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="p-4 font-semibold text-sm">Applicant</th>
                  <th className="p-4 font-semibold text-sm">Status</th>
                  <th className="p-4 font-semibold text-sm text-right">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {applications.length === 0 ? (
                  <tr><td colSpan={3} className="p-12 text-center text-muted-foreground">No applications found.</td></tr>
                ) : applications.map((app) => (
                  <ApplicationRow key={app.id} app={app} isSelected={selectedApp?.id === app.id} onClick={() => {setSelectedApp(app); setShowHistory(false);}} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {selectedApp && (
          <div className="lg:col-span-5">
            <ApplicationDetails 
              selectedApp={selectedApp} setSelectedApp={setSelectedApp} fetchHistory={fetchHistory} updateStatus={updateStatus} 
              note={note} setNote={setNote} showHistory={showHistory} setShowHistory={setShowHistory} history={history}
            />
          </div>
        )}
      </div>
    </div>
  );
}
