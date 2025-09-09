import { useQuery } from 'react-query';

// Mock data - replace with actual API calls
const mockInventory = {
  totalItems: 1250,
  availableItems: 1200,
  borrowedItems: 45,
  damagedItems: 5,
  lowStockItems: 12,
};

const mockRecentActivity = [
  {
    id: '1',
    type: 'success',
    message: 'Item returned successfully',
    timestamp: '2024-01-20T10:30:00Z',
  },
  {
    id: '2',
    type: 'info',
    message: 'New item added to inventory',
    timestamp: '2024-01-20T09:15:00Z',
  },
  {
    id: '3',
    type: 'warning',
    message: 'Low stock alert for Laptop - Dell XPS 13',
    timestamp: '2024-01-20T08:45:00Z',
  },
];

export const useInventory = () => {
  const { data: inventory, isLoading } = useQuery('inventory', () => {
    return Promise.resolve(mockInventory);
  });

  const { data: recentActivity } = useQuery('recentActivity', () => {
    return Promise.resolve(mockRecentActivity);
  });

  return {
    inventory,
    recentActivity,
    isLoading,
  };
};