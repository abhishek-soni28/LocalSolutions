import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

export const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use refs to avoid dependency changes
  const urlRef = useRef(url);
  const optionsRef = useRef(options);
  const loadingRef = useRef(false);

  // Update refs when props change
  useEffect(() => {
    urlRef.current = url;
    optionsRef.current = options;
  }, [url, options]);

  const fetchData = useCallback(async (params = {}) => {
    // Prevent multiple simultaneous requests
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const currentUrl = urlRef.current;
      const currentOptions = optionsRef.current;

      const response = await api({
        url: currentUrl,
        method: currentOptions.method || 'GET',
        params: currentOptions.params,
        data: currentOptions.data || params,
        ...currentOptions
      });

      setData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          err.message ||
                          'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to prevent recreation

  // Initial data fetch - only run once on mount
  useEffect(() => {
    let isMounted = true;

    const initialFetch = async () => {
      if (!options.manual && isMounted) {
        await fetchData();
      }
    };

    initialFetch();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
    // We intentionally only want this to run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};