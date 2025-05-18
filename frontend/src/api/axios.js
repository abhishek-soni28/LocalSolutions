import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is due to an expired token and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Clear the current token
        localStorage.removeItem('token');
        delete instance.defaults.headers.common['Authorization'];

        // If the user was on a protected route, redirect to login
        if (!window.location.pathname.includes('/login')) {
          // Store the current location to redirect back after login
          sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
          window.location.href = '/login';
        }

        return Promise.reject(error);
      } catch (refreshError) {
        console.error('Error during authentication refresh:', refreshError);
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other error statuses
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
      // Optionally redirect to a forbidden page
      // window.location.href = '/forbidden';
    }

    // Network errors
    if (!error.response) {
      console.error('Network error:', error);
      // Optionally show a network error message
    }

    return Promise.reject(error);
  }
);

export default instance;