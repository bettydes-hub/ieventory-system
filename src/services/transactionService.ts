import api from './api';
import { Transaction, PaginatedResponse } from '@/types';

export const transactionService = {
  getTransactions: async (params?: any): Promise<PaginatedResponse<Transaction>> => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  getTransaction: async (id: string): Promise<Transaction> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  borrowItem: async (data: {
    itemId: string;
    quantity: number;
    dueDate?: string;
    notes?: string;
  }): Promise<Transaction> => {
    const response = await api.post('/transactions/borrow', data);
    return response.data;
  },

  returnItem: async (data: {
    transactionId: string;
    quantity: number;
    notes?: string;
  }): Promise<Transaction> => {
    const response = await api.post('/transactions/return', data);
    return response.data;
  },

  approveTransaction: async (id: string): Promise<Transaction> => {
    const response = await api.put(`/transactions/${id}/approve`);
    return response.data;
  },

  cancelTransaction: async (id: string, reason?: string): Promise<Transaction> => {
    const response = await api.put(`/transactions/${id}/cancel`, { reason });
    return response.data;
  },

  getOverdueTransactions: async (): Promise<Transaction[]> => {
    const response = await api.get('/transactions/overdue');
    return response.data;
  },

  getMyTransactions: async (): Promise<Transaction[]> => {
    const response = await api.get('/transactions/my');
    return response.data;
  },
};
