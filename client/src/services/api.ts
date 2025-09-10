import axios from 'axios';
import { message } from 'antd';
import { config } from '@/config';

// Create axios instance
const api = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
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
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only redirect to login if it's not a login request itself
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      const isBasecampRequest = error.config?.url?.includes('/auth/basecamp');
      
      if (!isLoginRequest && !isBasecampRequest) {
        // Only clear auth and redirect if it's not a login attempt
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.response?.status >= 500) {
      message.error('Server error. Please try again later.');
    } else if (error.response?.data?.message) {
      message.error(error.response.data.message);
    } else {
      message.error('An error occurred. Please try again.');
    }
    return Promise.reject(error);
  }
);

export default api;