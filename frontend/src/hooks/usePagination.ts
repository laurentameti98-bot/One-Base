import { useState } from 'react';

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Hook for managing pagination state and calculations
 * @param initialPageSize - Initial page size (default: 20)
 * @returns Pagination state, update function, and calculated indices
 */
export function usePagination(initialPageSize: number = 20) {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: initialPageSize,
    total: 0,
    totalPages: 0,
  });

  const startIndex = pagination.total > 0 
    ? (pagination.page - 1) * pagination.pageSize + 1 
    : 0;
  const endIndex = Math.min(
    pagination.page * pagination.pageSize, 
    pagination.total
  );

  // Guarded update function (only updates if values changed)
  const updatePagination = (newPagination: PaginationState) => {
    setPagination(prev => {
      if (
        prev.page === newPagination.page &&
        prev.pageSize === newPagination.pageSize &&
        prev.total === newPagination.total &&
        prev.totalPages === newPagination.totalPages
      ) {
        return prev; // Return same reference to avoid unnecessary re-render
      }
      return newPagination;
    });
  };

  return { pagination, setPagination, updatePagination, startIndex, endIndex };
}
