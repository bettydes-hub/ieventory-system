import api from './api';
import { AuditLog, PaginatedResponse } from '@/types';

export const auditService = {
  getAuditLogs: async (params?: any): Promise<PaginatedResponse<AuditLog>> => {
    const response = await api.get('/audit/logs', { params });
    return response.data;
  },

  getAuditLog: async (id: string): Promise<AuditLog> => {
    const response = await api.get(`/audit/logs/${id}`);
    return response.data;
  },

  generateReport: async (type: 'inventory' | 'transactions' | 'damages' | 'deliveries', params?: any): Promise<any> => {
    const response = await api.get(`/audit/reports/${type}`, { params });
    return response.data;
  },

  getAuditStatistics: async (): Promise<any> => {
    const response = await api.get('/audit/statistics');
    return response.data;
  },

  exportAuditLogs: async (params?: any): Promise<Blob> => {
    const response = await api.get('/audit/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};
