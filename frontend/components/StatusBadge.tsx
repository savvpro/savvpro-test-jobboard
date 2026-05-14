import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatusBadgeProps {
  status: "pending" | "shortlisted" | "offered" | "rejected";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-700 border-amber-200";
      case "shortlisted": return "bg-blue-100 text-blue-700 border-blue-200";
      case "offered": return "bg-green-100 text-green-700 border-green-200";
      case "rejected": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <span className={cn("px-2 py-1 rounded-full text-xs font-semibold border capitalize", getStatusColor(status))}>
      {status}
    </span>
  );
}
