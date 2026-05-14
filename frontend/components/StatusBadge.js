"use client";

/**
 * StatusBadge — Color-coded badge for application or job status.
 * Required reusable component per task spec.
 */
export default function StatusBadge({ status }) {
  if (!status) {
    return null;
  }

  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={`badge badge-${status}`}>{label}</span>;
}
