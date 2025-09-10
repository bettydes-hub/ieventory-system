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
      
      // Mock data for testing - remove this when backend is working
      const mockUsers = {
        'admin@inventory.com': {
          user: {
            id: '1',
            name: 'Admin User',
            email: 'admin@inventory.com',
            role: 'Admin'
          },
          token: 'mock-admin-token-123'
        },
        'employee@inventory.com': {
          user: {
            id: '2',
            name: 'Employee User',
            email: 'employee@inventory.com',
            role: 'Employee'
          },
          token: 'mock-employee-token-456'
        },
        'storekeeper@inventory.com': {
          user: {
            id: '3',
            name: 'Store Keeper',
            email: 'storekeeper@inventory.com',
            role: 'Store Keeper'
          },
          token: 'mock-storekeeper-token-789'
        },
        'delivery@inventory.com': {
          user: {
            id: '4',
            name: 'Delivery Staff',
            email: 'delivery@inventory.com',
            role: 'Delivery Staff'
          },
          token: 'mock-delivery-token-101'
        }
      };

      // Check if user exists in mock data
      if (mockUsers[credentials.email as keyof typeof mockUsers]) {
        const userData = mockUsers[credentials.email as keyof typeof mockUsers];
        console.log('Mock login successful:', userData);
        return userData;
      }

      // If not found, try real API call
      const response = await api.post('/auth/login', credentials);
      console.log('Login response:', response.data);
      
      return handleApiResponse(response);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // If it's a network error, use mock data as fallback
      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
        console.log('Network error detected, using mock data fallback');
        const mockUsers = {
          'admin@inventory.com': {
            user: {
              id: '1',
              name: 'Admin User',
              email: 'admin@inventory.com',
              role: 'Admin'
            },
            token: 'mock-admin-token-123'
          },
          'employee@inventory.com': {
            user: {
              id: '2',
              name: 'Employee User',
              email: 'employee@inventory.com',
              role: 'Employee'
            },
            token: 'mock-employee-token-456'
          }
        };

        if (mockUsers[credentials.email as keyof typeof mockUsers]) {
          return mockUsers[credentials.email as keyof typeof mockUsers];
        }
      }

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