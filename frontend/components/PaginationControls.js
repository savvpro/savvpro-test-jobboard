"use client";

/**
 * PaginationControls — Page navigation with prev/next buttons.
 * Required reusable component per task spec.
 */
export default function PaginationControls({ page, perPage, totalCount, onPageChange }) {
  const totalPages = Math.ceil(totalCount / perPage);

  if (totalPages <= 1) return null;

  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, totalCount);

  return (
    <div className="pagination">
      <span className="page-info">
        Showing {start}-{end} of {totalCount} results
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          ← Previous
        </button>
        <span className="page-info">Page {page} of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next →
        </button>
      </div>
    </div>
  );
}
