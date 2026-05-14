"use client";

import { useState } from "react";
import StatusBadge from "./StatusBadge";
import { updateApplicationStatus } from "@/lib/api";

/**
 * ApplicationRow — Renders a single application in the pipeline table.
 * Required reusable component per task spec.
 */
export default function ApplicationRow({ application, onStatusUpdated }) {
  const [showActions, setShowActions] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [targetStatus, setTargetStatus] = useState("");

  const VALID_TRANSITIONS = {
    pending: ["shortlisted", "rejected"],
    shortlisted: ["offered", "rejected"],
    offered: ["rejected"],
    rejected: [],
  };

  const allowedTransitions = VALID_TRANSITIONS[application.status] || [];

  async function handleStatusUpdate() {
    if (!note.trim() || !targetStatus) return;
    setLoading(true);
    setError("");
    try {
      await updateApplicationStatus(application.id, { status: targetStatus, note });
      setShowActions(false);
      setNote("");
      setTargetStatus("");
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <tr>
        <td>
          <div style={{ fontWeight: 600 }}>{application.applicant_name}</div>
          <div style={{ fontSize: "0.813rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>{application.email}</div>
        </td>
        <td>{application.years_experience} yrs</td>
        <td><StatusBadge status={application.status} /></td>
        <td style={{ color: "var(--text-secondary)" }}>
          {new Date(application.created_at).toLocaleDateString()}
        </td>
        <td className="text-right">
          {allowedTransitions.length > 0 && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowActions(!showActions)}
            >
              {showActions ? "Cancel" : "Update"}
            </button>
          )}
        </td>
      </tr>
      {showActions && (
        <tr>
          <td colSpan={5} style={{ background: "var(--bg-card-hover)", padding: "1.5rem", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "150px" }}>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>
                  New Status
                </label>
                <select
                  className="form-select"
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                >
                  <option value="">Select...</option>
                  {allowedTransitions.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 2, minWidth: "200px" }}>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>
                  Note (required)
                </label>
                <input
                  className="form-input"
                  placeholder="Reason for status change..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary btn-sm"
                disabled={!targetStatus || !note.trim() || loading}
                onClick={handleStatusUpdate}
              >
                {loading ? "Saving..." : "Confirm"}
              </button>
            </div>
            {error && <p className="alert alert-error" style={{ marginTop: "0.5rem" }}>{error}</p>}
          </td>
        </tr>
      )}
    </>
  );
}
