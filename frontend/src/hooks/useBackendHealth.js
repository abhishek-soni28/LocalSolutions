import { useState, useEffect, useCallback } from 'react';
import { checkBackendHealth } from '../services/api';

const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

const useBackendHealth = () => {
  const [isBackendUp, setIsBackendUp] = useState(false); // Start with false to ensure initial check
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = useCallback(async () => {
    if (isChecking) return; // Prevent multiple simultaneous checks
    
    setIsChecking(true);
    try {
      const isUp = await checkBackendHealth();
      console.log('Backend health check result:', isUp);
      setIsBackendUp(isUp);
    } catch (error) {
      console.error('Backend health check failed:', error);
      setIsBackendUp(false);
    } finally {
      setIsChecking(false);
    }
  }, [isChecking]);

  useEffect(() => {
    // Initial check
    checkHealth();

    // Set up periodic checks
    const intervalId = setInterval(checkHealth, HEALTH_CHECK_INTERVAL);

    // Check when the page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkHealth();
      }
    };

    // Check when the network comes back online
    const handleOnline = () => {
      checkHealth();
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [checkHealth]);

  return { isBackendUp, isChecking, checkHealth };
};

export default useBackendHealth; 