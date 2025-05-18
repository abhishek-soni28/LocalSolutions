import { useCallback } from 'react';

const useValidation = () => {
  const validateEmail = useCallback((email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }, []);

  const validatePassword = useCallback((password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return re.test(password);
  }, []);

  const validateUsername = useCallback((username) => {
    // 3-20 characters, alphanumeric and underscore
    const re = /^[a-zA-Z0-9_]{3,20}$/;
    return re.test(username);
  }, []);

  const validateRequired = useCallback((value) => {
    return value && value.trim().length > 0;
  }, []);

  const validateLength = useCallback((value, min, max) => {
    return value.length >= min && value.length <= max;
  }, []);

  const validateNumber = useCallback((value, min, max) => {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  }, []);

  return {
    validateEmail,
    validatePassword,
    validateUsername,
    validateRequired,
    validateLength,
    validateNumber,
  };
};

export default useValidation; 