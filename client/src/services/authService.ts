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

// Helper function to standardize API response handling
const handleApiResponse = (response: any) => {
  // Check if response has success property and data wrapper
  if (response.data && typeof response.data === 'object') {
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    // If no success property, return the data directly
    return response.data;
  }
  return response.data;
};

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      console.log('Attempting login with credentials:', credentials);
      
      // Use real API call to connect to your database
      const response = await api.post('/auth/login', credentials);
      console.log('Login response:', response.data);
      
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle different types of errors with specific messages
      if (error.response?.data) {
        const errorResponse = error.response.data;
        const status = error.response.status;
        
        // Handle specific error types from backend
        if (errorResponse.errorType === 'EMAIL_NOT_FOUND') {
          throw {
            message: '❌ Email not found! Please check your email address.',
            errorType: 'EMAIL_NOT_FOUND',
            status: status
          };
        } else if (errorResponse.errorType === 'INVALID_PASSWORD') {
          throw {
            message: '❌ Wrong password! Please check your password.',
            errorType: 'INVALID_PASSWORD', 
            status: status
          };
        } else if (errorResponse.errorType === 'ACCOUNT_DEACTIVATED') {
          throw {
            message: '❌ Account is deactivated! Please contact administrator.',
            errorType: 'ACCOUNT_DEACTIVATED',
            status: status
          };
        } else if (status === 401) {
          throw {
            message: '❌ Invalid credentials! Please check both email and password.',
            errorType: 'INVALID_CREDENTIALS',
            status: status
          };
        } else if (status === 422) {
          throw {
            message: '❌ Invalid input! Please check your email format.',
            errorType: 'VALIDATION_ERROR',
            status: status
          };
        } else {
          throw {
            message: `❌ Server error: ${errorResponse.message || 'Please try again later.'}`,
            errorType: 'SERVER_ERROR',
            status: status
          };
        }
      } else if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
        throw {
          message: '❌ Cannot connect to server! Please check if backend is running.',
          errorType: 'NETWORK_ERROR',
          status: 0
        };
      } else {
        throw {
          message: '❌ Login failed! Please try again.',
          errorType: 'UNKNOWN_ERROR',
          status: 500
        };
      }
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
      return handleApiResponse(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  },

  updateProfile: async (data: any) => {
    try {
      const response = await api.put('/auth/profile', data);
      return handleApiResponse(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  basecampLogin: async (data: BasecampLoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post('/auth/basecamp/callback', data);
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Basecamp login error:', error);
      throw new Error(error.response?.data?.message || 'Basecamp authentication failed');
    }
  },
};