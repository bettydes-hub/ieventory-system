import api from './api';
import { SearchResult, SearchFilters } from '@/types';

export const searchService = {
  globalSearch: async (query: string, filters?: SearchFilters): Promise<SearchResult[]> => {
    const response = await api.post('/search/global', { query, filters });
    return response.data;
  },

  searchItems: async (query: string, filters?: SearchFilters): Promise<SearchResult[]> => {
    const response = await api.post('/search/items', { query, filters });
    return response.data;
  },

  searchTransactions: async (query: string, filters?: SearchFilters): Promise<SearchResult[]> => {
    const response = await api.post('/search/transactions', { query, filters });
    return response.data;
  },

  searchDeliveries: async (query: string, filters?: SearchFilters): Promise<SearchResult[]> => {
    const response = await api.post('/search/deliveries', { query, filters });
    return response.data;
  },

  getSearchSuggestions: async (query: string): Promise<string[]> => {
    const response = await api.get('/search/suggestions', { params: { q: query } });
    return response.data;
  },
};
