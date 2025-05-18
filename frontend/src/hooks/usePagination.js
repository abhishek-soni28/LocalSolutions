import { useState, useCallback } from 'react';

const usePagination = (initialPage = 1, initialPageSize = 10) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage + 1);
  }, []);

  const handlePageSizeChange = useCallback((event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(1);
  }, []);

  const resetPagination = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  const getPaginationProps = useCallback(() => ({
    page,
    pageSize,
    totalItems,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
  }), [page, pageSize, totalItems, handlePageChange, handlePageSizeChange]);

  return {
    page,
    pageSize,
    totalItems,
    setTotalItems,
    handlePageChange,
    handlePageSizeChange,
    resetPagination,
    getPaginationProps,
  };
};

export default usePagination; 