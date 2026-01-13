interface PaginationNumberedProps {
  pagination: { page: number; totalPages: number; total: number };
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
}

export function PaginationNumbered({ pagination, startIndex, endIndex, onPageChange }: PaginationNumberedProps) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      <div className="pagination-info">Showing {startIndex}–{endIndex} of {pagination.total}</div>
      <div className="pagination-controls">
        <button
          className="pagination-btn"
          disabled={pagination.page === 1}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          Previous
        </button>
        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
          let pageNum;
          if (pagination.totalPages <= 5) {
            pageNum = i + 1;
          } else if (pagination.page <= 3) {
            pageNum = i + 1;
          } else if (pagination.page >= pagination.totalPages - 2) {
            pageNum = pagination.totalPages - 4 + i;
          } else {
            pageNum = pagination.page - 2 + i;
          }
          return (
            <button
              key={pageNum}
              className={`pagination-btn ${pageNum === pagination.page ? 'active' : ''}`}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </button>
          );
        })}
        {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
          <span style={{ padding: '0 var(--space-sm)' }}>...</span>
        )}
        {pagination.totalPages > 5 && (
          <button
            className="pagination-btn"
            onClick={() => onPageChange(pagination.totalPages)}
          >
            {pagination.totalPages}
          </button>
        )}
        <button
          className="pagination-btn"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
