import { useState, useEffect } from 'react';
import api from '../api/axios';

const useBackendHealth = () => {
  const [isBackendUp, setIsBackendUp] = useState(true); // Assume backend is up initially
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setIsChecking(true);
        const response = await api.get('/actuator/health', {
          timeout: 5000, // 5 second timeout
          // Don't trigger the auth interceptor on failure
          skipAuthRefresh: true
        });
        setIsBackendUp(response.status === 200 && response.data?.status === 'UP');
        setError(null);
      } catch (error) {
        console.warn('Backend health check failed:', error.message);
        setIsBackendUp(false);
        setError(error.message);
      } finally {
        setIsChecking(false);
      }
    };

    // Initial check
    checkHealth();

    // Set up interval for periodic checks
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return { isBackendUp, isChecking, error };
};

export default useBackendHealth;