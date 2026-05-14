"use client";

import { useState } from "react";
import { Application, api } from "@/lib/api";
import StatusBadge from "./StatusBadge";

interface ApplicationRowProps {
  application: Application;
  onStatusUpdate?: (updated: Application) => void;
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending:     ["shortlisted", "rejected"],
  shortlisted: ["offered", "rejected"],
  offered:     ["rejected"],
  rejected:    [],
};

export default function ApplicationRow({
  application,
  onStatusUpdate,
}: ApplicationRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validNext = VALID_TRANSITIONS[application.current_status] ?? [];

  const handleUpdate = async () => {
    if (!newStatus || !note.trim()) {
      setError("Please select a status and enter a note.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const updated = await api.updateStatus(application.id, { new_status: newStatus, note });
      onStatusUpdate?.(updated);
      setNewStatus("");
      setNote("");
      setExpanded(false);
    } catch (e: unknown) {
      const err = e as { detail?: string };
      setError(err?.detail ?? "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="application-row">
      <div className="application-row-header" onClick={() => setExpanded(!expanded)}>
        <div className="applicant-info">
          <div className="applicant-avatar">
            {application.applicant_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="applicant-name">{application.applicant_name}</p>
            <p className="applicant-email">{application.email}</p>
          </div>
        </div>
        <div className="application-meta">
          <span className="experience-badge">{application.years_experience} yr{application.years_experience !== 1 ? "s" : ""} exp</span>
          <StatusBadge status={application.current_status} />
          <span className="expand-icon">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && (
        <div className="application-detail">
          <div className="cv-section">
            <h4>CV Summary</h4>
            <p>{application.cv_summary}</p>
            {application.linkedin_url && (
              <a href={application.linkedin_url} target="_blank" rel="noopener noreferrer" className="linkedin-link">
                🔗 LinkedIn Profile
              </a>
            )}
          </div>

          <div className="history-section">
            <h4>Status History</h4>
            <div className="history-timeline">
              {application.status_history.map((h) => (
                <div key={h.id} className="history-item">
                  <div className="history-dot" />
                  <div className="history-content">
                    <div className="history-transition">
                      {h.from_status ? (
                        <>
                          <StatusBadge status={h.from_status} size="sm" />
                          <span className="history-arrow">→</span>
                        </>
                      ) : null}
                      <StatusBadge status={h.to_status} size="sm" />
                    </div>
                    <p className="history-note">"{h.note}"</p>
                    <p className="history-date">
                      {new Date(h.changed_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {validNext.length > 0 && (
            <div className="status-update-section">
              <h4>Update Status</h4>
              {error && <p className="form-error">{error}</p>}
              <div className="status-update-form">
                <select
                  id={`status-select-${application.id}`}
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="status-select"
                >
                  <option value="">Select new status…</option>
                  {validNext.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Add a note (required)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="note-input"
                  id={`note-input-${application.id}`}
                />
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="btn-primary"
                  id={`update-status-btn-${application.id}`}
                >
                  {loading ? "Updating…" : "Update"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
