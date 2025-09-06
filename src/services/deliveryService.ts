import api from './api';
import { Delivery, PaginatedResponse } from '@/types';

export const deliveryService = {
  getDeliveries: async (params?: any): Promise<PaginatedResponse<Delivery>> => {
    const response = await api.get('/deliveries', { params });
    return response.data;
  },

  getDelivery: async (id: string): Promise<Delivery> => {
    const response = await api.get(`/deliveries/${id}`);
    return response.data;
  },

  assignDelivery: async (data: {
    transactionId: string;
    assignedTo: string;
    pickupAddress: string;
    deliveryAddress: string;
    scheduledDate?: string;
    notes?: string;
  }): Promise<Delivery> => {
    const response = await api.post('/deliveries', data);
    return response.data;
  },

  updateDeliveryStatus: async (id: string, data: {
    status: 'Assigned' | 'Picked Up' | 'In Progress' | 'Completed' | 'Cancelled';
    notes?: string;
  }): Promise<Delivery> => {
    const response = await api.put(`/deliveries/${id}`, data);
    return response.data;
  },

  getMyDeliveries: async (): Promise<Delivery[]> => {
    const response = await api.get('/deliveries/my');
    return response.data;
  },

  getPendingDeliveries: async (): Promise<Delivery[]> => {
    const response = await api.get('/deliveries/pending');
    return response.data;
  },
};
