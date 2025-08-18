import { useCallback, useMemo, useState } from 'react';

export const usePagination = ({
  initialPage = 1,
  initialLimit = 10,
  maxLimit = 100,
} = {}) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => {
    return Math.ceil(total / limit);
  }, [total, limit]);

  const hasNext = useMemo(() => {
    return page < totalPages;
  }, [page, totalPages]);

  const hasPrev = useMemo(() => {
    return page > 1;
  }, [page]);

  const startIndex = useMemo(() => {
    return (page - 1) * limit + 1;
  }, [page, limit]);

  const endIndex = useMemo(() => {
    return Math.min(page * limit, total);
  }, [page, limit, total]);

  const goToPage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNext) {
      setPage(prev => prev + 1);
    }
  }, [hasNext]);

  const prevPage = useCallback(() => {
    if (hasPrev) {
      setPage(prev => prev - 1);
    }
  }, [hasPrev]);

  const firstPage = useCallback(() => {
    setPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setPage(totalPages);
  }, [totalPages]);

  const changeLimit = useCallback((newLimit) => {
    const validLimit = Math.min(Math.max(1, newLimit), maxLimit);
    setLimit(validLimit);
    setPage(1); // Reset to first page when changing limit
  }, [maxLimit]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
    setTotal(0);
  }, [initialPage, initialLimit]);

  const getPageNumbers = useCallback((maxVisible = 5) => {
    const pages = [];
    const half = Math.floor(maxVisible / 2);
    
    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }, [page, totalPages]);

  const getPaginationInfo = useCallback(() => {
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
      startIndex,
      endIndex,
      showing: total > 0 ? `${startIndex}-${endIndex} of ${total}` : '0 results',
    };
  }, [page, limit, total, totalPages, hasNext, hasPrev, startIndex, endIndex]);

  return {
    // State
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
    startIndex,
    endIndex,
    
    // Actions
    setTotal,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    changeLimit,
    reset,
    
    // Utilities
    getPageNumbers,
    getPaginationInfo,
  };
};

export default usePagination;