import { useQuery } from 'react-query';

// Mock data - replace with actual API calls
const mockInventorySummary = {
  totalItems: 1250,
  totalStores: 5,
  totalSuppliers: 12,
  lowStockItems: 8,
  availableItems: 1200,
  borrowedItems: 45,
  damagedItems: 5,
};

const mockLowStockAlerts = [
  {
    id: '1',
    name: 'Laptop - Dell XPS 13',
    quantity: 2,
    minStockLevel: 5,
  },
  {
    id: '2',
    name: 'USB Cable Type-C',
    quantity: 1,
    minStockLevel: 10,
  },
  {
    id: '3',
    name: 'Monitor Stand',
    quantity: 0,
    minStockLevel: 3,
  },
];

export const useInventory = () => {
  const { data: inventorySummary, isLoading: summaryLoading } = useQuery('inventorySummary', () => {
    return Promise.resolve(mockInventorySummary);
  });

  const { data: lowStockAlerts, isLoading: alertsLoading } = useQuery('lowStockAlerts', () => {
    return Promise.resolve(mockLowStockAlerts);
  });

  return {
    inventorySummary,
    summaryLoading,
    lowStockAlerts,
    alertsLoading,
  };
};