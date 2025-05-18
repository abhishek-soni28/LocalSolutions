import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './useDebounce';

const useSearch = (initialQuery = '', searchFunction, delay = 500) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedQuery = useDebounce(query, delay);

  const handleSearch = useCallback(async () => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await searchFunction(debouncedQuery);
      setResults(data);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, searchFunction]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleQueryChange = useCallback((event) => {
    setQuery(event.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    results,
    loading,
    error,
    handleQueryChange,
    clearSearch,
  };
};

export default useSearch; 