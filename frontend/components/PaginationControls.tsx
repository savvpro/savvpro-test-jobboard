"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ page, totalPages, onPageChange }: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 pt-8">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="p-2 border rounded-xl disabled:opacity-50 hover:bg-muted transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <span className="text-sm font-medium">
        Page {page} of {totalPages}
      </span>
      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="p-2 border rounded-xl disabled:opacity-50 hover:bg-muted transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
