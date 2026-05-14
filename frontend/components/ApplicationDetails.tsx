"use client";

import { X, History, Award, Check, XCircle } from "lucide-react";
import Link from "next/link";
import { Application, HistoryEvent } from "@/types";

interface Props {
  selectedApp: Application;
  setSelectedApp: (app: Application | null) => void;
  fetchHistory: (id: number) => void;
  updateStatus: (id: number, status: string) => void;
  note: string;
  setNote: (note: string) => void;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  history: HistoryEvent[];
}

export function ApplicationDetails({
  selectedApp,
  setSelectedApp,
  fetchHistory,
  updateStatus,
  note,
  setNote,
  showHistory,
  setShowHistory,
  history
}: Props) {
  return (
    <div className="bg-background border rounded-2xl p-6 shadow-xl sticky top-24 animate-in slide-in-from-right duration-300">
      <div className="flex justify-between items-start border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold">Details</h2>
        <button onClick={() => setSelectedApp(null)} className="p-1 hover:bg-slate-100 rounded">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Experience</p>
            <p className="font-medium">{selectedApp.years_experience} Years</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Applied</p>
            <p className="font-medium">{new Date(selectedApp.applied_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Summary</p>
          <p className="text-sm bg-slate-50 p-3 rounded-xl border italic leading-relaxed">"{selectedApp.cv_summary}"</p>
        </div>
        {selectedApp.linkedin_url && (
          <Link href={selectedApp.linkedin_url} target="_blank" className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1">
            LinkedIn Profile &rarr;
          </Link>
        )}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Update Status</h3>
            <button onClick={() => fetchHistory(selectedApp.id)} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              <History className="h-3 w-3" /> View History
            </button>
          </div>
          <textarea 
            placeholder="Add a required note for the status change..."
            className="w-full p-3 border rounded-xl text-sm h-24 focus:ring-2 ring-primary-500 outline-none"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            {selectedApp.status === "pending" && (
              <button onClick={() => updateStatus(selectedApp.id, "shortlisted")} className="flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all">
                <Award className="h-4 w-4" /> Shortlist
              </button>
            )}
            {selectedApp.status === "shortlisted" && (
              <button onClick={() => updateStatus(selectedApp.id, "offered")} className="flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-all">
                <Check className="h-4 w-4" /> Make Offer
              </button>
            )}
            {selectedApp.status !== "rejected" && selectedApp.status !== "offered" && (
              <button onClick={() => updateStatus(selectedApp.id, "rejected")} className="flex items-center justify-center gap-2 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-red-100 hover:text-red-700 transition-all">
                <XCircle className="h-4 w-4" /> Reject
              </button>
            )}
          </div>
        </div>
      </div>
      {showHistory && (
        <ApplicationHistoryOverlay 
          history={history} 
          onClose={() => setShowHistory(false)} 
        />
      )}
    </div>
  );
}

function ApplicationHistoryOverlay({ history, onClose }: { history: HistoryEvent[], onClose: () => void }) {
  return (
    <div className="absolute inset-0 bg-white z-10 p-6 rounded-2xl animate-in fade-in duration-300 overflow-y-auto">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h3 className="text-xl font-bold">Status History</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="space-y-4">
        {history.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">No history yet.</p>
        ) : history.map((event) => (
          <div key={event.id} className="relative pl-6 border-l-2 border-primary-200 py-1">
            <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-primary-500 border-2 border-white shadow-sm" />
            <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
              <span>{event.from_status} &rarr; {event.to_status}</span>
              <span>{new Date(event.timestamp).toLocaleString()}</span>
            </div>
            <p className="text-sm mt-1 text-slate-600 bg-slate-50 p-2 rounded-lg border">{event.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
