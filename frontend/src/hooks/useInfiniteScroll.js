import { useState, useEffect, useCallback, useRef } from 'react';

const useInfiniteScroll = (fetchFunction, hasMore) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const observer = useRef();

  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchFunction();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, fetchFunction]
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await fetchFunction();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    loading,
    error,
    lastElementRef,
  };
};

export default useInfiniteScroll; 