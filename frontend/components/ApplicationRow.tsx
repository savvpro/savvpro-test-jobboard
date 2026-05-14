"use client";

import { StatusBadge } from "./StatusBadge";
import { Application } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ApplicationRowProps {
  app: Application;
  isSelected: boolean;
  onClick: () => void;
}

export function ApplicationRow({ app, isSelected, onClick }: ApplicationRowProps) {
  return (
    <tr 
      onClick={onClick}
      className={cn(
        "group cursor-pointer hover:bg-slate-50 transition-colors",
        isSelected && "bg-primary-50 hover:bg-primary-50"
      )}
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
            {app.applicant_name[0]}
          </div>
          <div>
            <div className="font-bold">{app.applicant_name}</div>
            <div className="text-xs text-muted-foreground">{app.email}</div>
          </div>
        </div>
      </td>
      <td className="p-4">
        <StatusBadge status={app.status} />
      </td>
      <td className="p-4 text-right text-xs text-muted-foreground">
        {new Date(app.applied_at).toLocaleDateString()}
      </td>
    </tr>
  );
}
