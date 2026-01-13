interface PaginationSimpleProps {
  pagination: { page: number; totalPages: number; total: number };
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
}

export function PaginationSimple({ pagination, startIndex, endIndex, onPageChange }: PaginationSimpleProps) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing {startIndex}–{endIndex} of {pagination.total}
      </div>
      <div className="pagination-controls">
        <button
          className="btn btn-secondary btn-sm"
          disabled={pagination.page === 1}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          Previous
        </button>
        <span className="pagination-page-info">
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button
          className="btn btn-secondary btn-sm"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
