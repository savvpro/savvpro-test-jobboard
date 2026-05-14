"use client";

/**
 * PaginationControls — Page navigation with prev/next buttons.
 * Required reusable component per task spec.
 */
export default function PaginationControls({ page, perPage, totalCount, onPageChange }) {
  const totalPages = Math.ceil(totalCount / perPage);

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ← Previous
      </button>
      <span className="page-info">
        Page {page} of {totalPages} ({totalCount} results)
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next →
      </button>
    </div>
  );
}
