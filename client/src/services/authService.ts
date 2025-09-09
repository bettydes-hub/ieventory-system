import axios from 'axios';
import { BasecampLoginRequest, ChangePasswordRequest } from '@/types';

const API_BASE_URL = 'http://localhost:5000/api';

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
    // Mock login for now - replace with actual API call
    const mockUsers = [
      { 
        id: '1', 
        name: 'John Employee', 
        email: 'employee@inventory.com', 
        role: 'Employee',
        isFirstLogin: false,
        passwordChanged: true,
        createdAt: '2024-01-01'
      },
      { 
        id: '2', 
        name: 'Jane StoreKeeper', 
        email: 'storekeeper@inventory.com', 
        role: 'Store Keeper',
        isFirstLogin: true,
        passwordChanged: false,
        createdAt: '2024-01-15'
      },
      { 
        id: '3', 
        name: 'Bob Manager', 
        email: 'admin@inventory.com', 
        role: 'Admin',
        isFirstLogin: false,
        passwordChanged: true,
        createdAt: '2024-01-01'
      },
      { 
        id: '4', 
        name: 'Alice Delivery', 
        email: 'delivery@inventory.com', 
        role: 'Delivery Staff',
        isFirstLogin: true,
        passwordChanged: false,
        createdAt: '2024-01-10'
      },
      { 
        id: '5', 
        name: 'Demo Basecamp User', 
        email: 'demo@basecamp.com', 
        role: 'Employee',
        isFirstLogin: false,
        passwordChanged: true,
        createdAt: '2024-01-20'
      },
    ];

    const user = mockUsers.find(u => u.email === credentials.email);
    
    // Check for default password "changeme" or existing passwords
    const isDefaultPassword = credentials.password === 'changeme';
    const validPasswords = ['admin123', 'employee123', 'delivery123', 'basecamp123'];
    const isValidPassword = isDefaultPassword || validPasswords.includes(credentials.password);
    
    if (user && isValidPassword) {
      return {
        user,
        token: 'mock-jwt-token-' + user.id,
      };
    }
    throw new Error('Invalid credentials');
  },

  logout: async (): Promise<void> => {
    // Mock logout - replace with actual API call
    return Promise.resolve();
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    // Mock password change - replace with actual API call
    if (data.newPassword !== data.confirmPassword) {
      throw new Error('New passwords do not match');
    }
    
    if (data.newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return Promise.resolve();
  },

  getProfile: async () => {
    // Mock profile - replace with actual API call
    return {
      id: '1',
      name: 'John Employee',
      email: 'employee@test.com',
      role: 'Employee',
    };
  },

  updateProfile: async (data: any) => {
    // Mock update - replace with actual API call
    return data;
  },

  basecampLogin: async (data: BasecampLoginRequest): Promise<LoginResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/basecamp/callback`, data);
      return response.data;
    } catch (error) {
      console.error('Basecamp login error:', error);
      throw new Error('Basecamp authentication failed');
    }
  },
};