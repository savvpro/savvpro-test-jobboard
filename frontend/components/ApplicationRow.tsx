"use client";

import { useState } from "react";
import { Application, StatusEnum } from "@/lib/api";
import StatusBadge from "./StatusBadge";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ApplicationRowProps {
  application: Application;
  onStatusUpdate: (appId: number, status: StatusEnum, note: string) => Promise<void>;
}

const VALID_TRANSITIONS: Record<StatusEnum, StatusEnum[]> = {
  pending: ["shortlisted", "rejected"],
  shortlisted: ["offered", "rejected"],
  offered: ["rejected"], // According to typical pipeline
  rejected: [],
};

const STATUS_LABELS: Record<StatusEnum, string> = {
  pending: "Pending",
  shortlisted: "Shortlisted",
  offered: "Offered",
  rejected: "Rejected",
};

export default function ApplicationRow({ application, onStatusUpdate }: ApplicationRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<StatusEnum | "">("");
  const [note, setNote] = useState("");

  const availableTransitions = VALID_TRANSITIONS[application.status] || [];

  const handleUpdate = async () => {
    if (!selectedStatus) return;
    setUpdating(true);
    try {
      await onStatusUpdate(application.id, selectedStatus as StatusEnum, note || "Status updated.");
      setShowUpdateForm(false);
      setSelectedStatus("");
      setNote("");
    } catch {
      alert("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  const truncatedCv = application.cv_summary.length > 80
    ? application.cv_summary.substring(0, 80) + "..."
    : application.cv_summary;

  return (
    <div className="border border-border rounded-xl bg-white overflow-hidden transition-all duration-200 hover:border-gray-300">
      <div
        className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer hover:bg-gray-50/50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-textPrimary truncate">{application.applicant_name}</span>
            <span className="text-[13px] text-textSecondary bg-surface px-2 rounded-md font-medium">
              {application.years_experience} yoe
            </span>
          </div>
          <div className="text-[13px] text-textSecondary truncate">
            {application.email}
          </div>
        </div>

        <div className="flex-1 md:max-w-md hidden sm:block">
          <div className="text-[14px] text-textSecondary italic truncate">
            &quot;{truncatedCv}&quot;
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4 min-w-[200px]">
          <StatusBadge status={application.status} />

          <div className="flex items-center gap-2">
            {availableTransitions.length > 0 && !showUpdateForm && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUpdateForm(true);
                  setExpanded(true);
                }}
                className="text-[13px] font-medium text-accent hover:underline px-2 py-1 rounded"
              >
                Update
              </button>
            )}
            <div className="text-gray-400 p-1">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </div>
      </div>

      {(expanded || showUpdateForm) && (
        <div className="p-5 border-t border-border bg-gray-50/30">
          {expanded && !showUpdateForm && (
            <div className="space-y-4 animate-fade-up">
              <div>
                <h4 className="text-[13px] font-semibold text-textPrimary uppercase tracking-wider mb-2">Full Summary</h4>
                <p className="text-[14px] leading-relaxed text-textSecondary whitespace-pre-wrap">
                  {application.cv_summary}
                </p>
              </div>

              {application.linkedin_url && (
                <div>
                  <h4 className="text-[13px] font-semibold text-textPrimary uppercase tracking-wider mb-2">LinkedIn</h4>
                  <a
                    href={application.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[14px] text-accent hover:underline"
                  >
                    {application.linkedin_url}
                  </a>
                </div>
              )}

              {application.status_history && application.status_history.length > 0 && (
                <div>
                  <h4 className="text-[13px] font-semibold text-textPrimary uppercase tracking-wider mb-4">Status History</h4>
                  <div className="space-y-4">
                    {application.status_history.map((h, i) => (
                      <div key={h.id} className="relative pl-6 pb-2 last:pb-0">
                        {/* Vertical Line */}
                        {i < application.status_history.length - 1 && (
                          <div className="absolute left-[3px] top-[8px] bottom-0 w-[1px] bg-border" />
                        )}
                        {/* Dot */}
                        <div className="absolute left-0 top-[6px] w-[7px] h-[7px] rounded-full bg-border" />
                        
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[13px] font-bold text-textPrimary capitalize">
                              {h.to_status}
                            </span>
                            <span className="text-[12px] text-textTertiary">
                              {new Date(h.changed_at).toLocaleString('en-US', { 
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <p className="text-[14px] text-textSecondary italic">
                            &quot;{h.note}&quot;
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {showUpdateForm && (
            <div className="bg-white border border-border rounded-lg p-5 shadow-sm animate-fade-up">
              <h4 className="text-[15px] font-semibold text-textPrimary mb-4">Update Application Status</h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-textPrimary mb-1.5">New Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as StatusEnum)}
                    className="w-full border border-border rounded-md px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  >
                    <option value="" disabled>Select next step...</option>
                    {availableTransitions.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-textPrimary mb-1.5">Note (Required)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note about this decision..."
                    className="w-full border border-border rounded-md px-3 py-2 text-[14px] min-h-[80px] focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-y"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleUpdate}
                    disabled={!selectedStatus || !note.trim() || updating}
                    className="bg-accent text-white px-4 py-2 rounded-md text-[14px] font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updating ? "Saving..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => {
                      setShowUpdateForm(false);
                      setSelectedStatus("");
                      setNote("");
                    }}
                    disabled={updating}
                    className="text-[14px] font-medium text-textSecondary hover:text-textPrimary transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}