import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user data
      api
        .get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email });
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);

      const { token, id, username, email: userEmail, role, fullName } = response.data;

      if (!token) {
        console.error('No token received in login response');
        return {
          success: false,
          error: 'Authentication failed - no token received'
        };
      }

      // Store token in localStorage
      localStorage.setItem('token', token);

      // Set authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Create user object from response data
      const user = {
        id,
        username,
        email: userEmail,
        role,
        fullName
      };

      // Update the user state
      setUser(user);

      console.log('User authenticated:', user);

      // Check if there's a redirect path stored from a previous unauthorized access
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin');
        // Use navigate instead of window.location for smoother transitions
        return {
          success: true,
          redirectTo: redirectPath
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || error.response?.data || 'Login failed'
      };
    }
  };

  const register = async userData => {
    try {
      // Register the user
      const registerResponse = await api.post('/auth/register', userData);

      if (registerResponse.status !== 200) {
        throw new Error('Registration failed');
      }

      // After successful registration, login the user
      const loginResponse = await api.post('/auth/login', {
        email: userData.email,
        password: userData.password
      });

      const { token, id, username, email, role, fullName } = loginResponse.data;

      // Store token in localStorage
      localStorage.setItem('token', token);

      // Set authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Create user object from response data
      const user = {
        id,
        username,
        email,
        role,
        fullName
      };

      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data || 'Registration failed'
      };
    }
  };

  const logout = async () => {
    try {
      // Call the backend logout endpoint
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage and state, even if the API call fails
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};