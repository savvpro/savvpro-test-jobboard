"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  page: number;
  totalCount: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({ page, totalCount, perPage, onPageChange }: PaginationControlsProps) {
  const totalPages = Math.ceil(totalCount / perPage);
  if (totalPages <= 1) return null;

  const startResult = (page - 1) * perPage + 1;
  const endResult = Math.min(page * perPage, totalCount);

  // Generate page numbers
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 mb-4">
      <div className="text-[14px] text-textSecondary">
        Showing <span className="font-medium text-textPrimary">{startResult}–{endResult}</span> of <span className="font-medium text-textPrimary">{totalCount}</span> results
      </div>

      <div className="flex items-center gap-1">
        <button 
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 text-textSecondary disabled:opacity-30 disabled:cursor-not-allowed hover:text-textPrimary transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        
        <div className="flex items-center gap-0.5">
          {pages.map((p, idx) => (
            p === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-3 py-1 text-textTertiary">...</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                className={`min-w-[32px] h-[32px] rounded-md text-[14px] flex items-center justify-center transition-colors ${
                  page === p 
                    ? 'font-semibold text-accent bg-accent/5' 
                    : 'text-textSecondary hover:text-textPrimary hover:bg-surface2'
                }`}
              >
                {p}
              </button>
            )
          ))}
        </div>

        <button 
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 text-textSecondary disabled:opacity-30 disabled:cursor-not-allowed hover:text-textPrimary transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}