import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import api from '../../api/axios';
import { setUser } from '../../store/slices/authSlice';

const AuthInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('AuthInitializer: Token exists:', !!token);
      if (token) {
        try {
          console.log('AuthInitializer: Fetching user data...');
          // Fetch current user data
          // The endpoint is /api/auth/me but our axios instance already has the /api prefix
          const response = await api.get('/auth/me');
          console.log('AuthInitializer: User data received:', response.data);
          if (response.data) {
            // Set the user in Redux store
            dispatch(setUser(response.data));
            console.log('AuthInitializer: User set in Redux store');
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          // If there's an error (like expired token), remove the token
          localStorage.removeItem('token');
          console.log('AuthInitializer: Token removed due to error');
        }
      }
    };

    initializeAuth();
  }, [dispatch]);

  // This component doesn't render anything
  return null;
};

export default AuthInitializer;
