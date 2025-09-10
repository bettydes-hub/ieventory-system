import api from './api';
import { Item, CreateItemData, UpdateItemData, PaginatedResponse } from '@/types';

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

export const inventoryService = {
  // Items
  getItems: async (params?: any): Promise<PaginatedResponse<Item>> => {
    const response = await api.get('/inventory/items', { params });
    return handleApiResponse(response);
  },

  getItem: async (id: string): Promise<Item> => {
    const response = await api.get(`/inventory/items/${id}`);
    return handleApiResponse(response);
  },

  createItem: async (data: CreateItemData): Promise<Item> => {
    const response = await api.post('/inventory/items', data);
    return handleApiResponse(response);
  },

  updateItem: async (id: string, data: UpdateItemData): Promise<Item> => {
    const response = await api.put(`/inventory/items/${id}`, data);
    return handleApiResponse(response);
  },

  deleteItem: async (id: string): Promise<void> => {
    await api.delete(`/inventory/items/${id}`);
  },

  getInventorySummary: async (): Promise<any> => {
    const response = await api.get('/inventory/summary');
    return handleApiResponse(response);
  },

  getLowStockAlerts: async (): Promise<Item[]> => {
    const response = await api.get('/inventory/low-stock');
    return handleApiResponse(response);
  },

  transferItem: async (data: {
    itemId: string;
    fromStoreId: string;
    toStoreId: string;
    quantity: number;
    notes?: string;
  }): Promise<void> => {
    await api.post('/inventory/transfer', data);
  },

  generateQRCode: async (itemId: string): Promise<{ qrCode: string }> => {
    const response = await api.get(`/inventory/items/${itemId}/qr-code`);
    return response.data;
  },

  // Categories
  getCategories: async (): Promise<any[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  getCategory: async (id: string): Promise<any> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: any): Promise<any> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: any): Promise<any> => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },

  // Stores
  getStores: async (): Promise<any[]> => {
    const response = await api.get('/stores');
    return response.data;
  },

  getStore: async (id: string): Promise<any> => {
    const response = await api.get(`/stores/${id}`);
    return response.data;
  },

  createStore: async (data: any): Promise<any> => {
    const response = await api.post('/stores', data);
    return response.data;
  },

  updateStore: async (id: string, data: any): Promise<any> => {
    const response = await api.put(`/stores/${id}`, data);
    return response.data;
  },

  deleteStore: async (id: string): Promise<void> => {
    await api.delete(`/stores/${id}`);
  },

  // Suppliers
  getSuppliers: async (): Promise<any[]> => {
    const response = await api.get('/suppliers');
    return response.data;
  },

  getSupplier: async (id: string): Promise<any> => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  createSupplier: async (data: any): Promise<any> => {
    const response = await api.post('/suppliers', data);
    return response.data;
  },

  updateSupplier: async (id: string, data: any): Promise<any> => {
    const response = await api.put(`/suppliers/${id}`, data);
    return response.data;
  },

  deleteSupplier: async (id: string): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
  },
};