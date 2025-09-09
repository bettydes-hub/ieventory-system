import api from './api';
import { BasecampLoginRequest, ChangePasswordRequest } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      console.log('Attempting login with credentials:', credentials);
      const response = await api.post('/auth/login', credentials);
      console.log('Login response:', response.data);
      
      // Handle the backend response format where data is wrapped in a 'data' property
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Create a more detailed error object
      const errorResponse = error.response?.data;
      const errorObj = {
        message: errorResponse?.message || 'Login failed',
        errorType: errorResponse?.errorType || 'UNKNOWN_ERROR',
        status: error.response?.status || 500
      };
      throw errorObj;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, clear local storage
      console.error('Logout error:', error);
    }
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    try {
      await api.post('/auth/change-password', data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  },

  updateProfile: async (data: any) => {
    try {
      const response = await api.put('/auth/profile', data);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  basecampLogin: async (data: BasecampLoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post('/auth/basecamp/callback', data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Basecamp login error:', error);
      throw new Error(error.response?.data?.message || 'Basecamp authentication failed');
    }
  },
};