"use client";

type Status = "pending" | "shortlisted" | "offered" | "rejected";

interface StatusBadgeProps {
  status: Status | string;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:     { label: "Pending",     className: "badge-pending" },
  shortlisted: { label: "Shortlisted", className: "badge-shortlisted" },
  offered:     { label: "Offered",     className: "badge-offered" },
  rejected:    { label: "Rejected",    className: "badge-rejected" },
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: "badge-default" };
  return (
    <span className={`status-badge ${config.className} status-badge-${size}`}>
      <span className="status-dot" />
      {config.label}
    </span>
  );
}
