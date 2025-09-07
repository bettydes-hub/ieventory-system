import api from './api';
import { DamageReport, PaginatedResponse } from '@/types';

export const damageService = {
  getDamageReports: async (params?: any): Promise<PaginatedResponse<DamageReport>> => {
    const response = await api.get('/damages', { params });
    return response.data;
  },

  getDamageReport: async (id: string): Promise<DamageReport> => {
    const response = await api.get(`/damages/${id}`);
    return response.data;
  },

  reportDamage: async (data: {
    itemId: string;
    description: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    estimatedCost?: number;
  }): Promise<DamageReport> => {
    const response = await api.post('/damages', data);
    return response.data;
  },

  updateDamageStatus: async (id: string, data: {
    status: 'Pending' | 'In Progress' | 'Fixed' | 'Discarded';
    actualCost?: number;
    resolutionNotes?: string;
  }): Promise<DamageReport> => {
    const response = await api.put(`/damages/${id}`, data);
    return response.data;
  },

  getMyDamageReports: async (): Promise<DamageReport[]> => {
    const response = await api.get('/damages/my');
    return response.data;
  },

  getPendingDamageReports: async (): Promise<DamageReport[]> => {
    const response = await api.get('/damages/pending');
    return response.data;
  },
};
