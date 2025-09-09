import { useQuery } from 'react-query';
import { dashboardService, DashboardStats, ChartData, TimeSeriesData } from '@/services/dashboardService';

export const useDashboard = () => {
  // Get dashboard statistics
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery<DashboardStats>(
    'dashboard-stats',
    dashboardService.getDashboardStats,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 10000, // Consider data stale after 10 seconds
    }
  );

  // Get item categories
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery<ChartData[]>(
    'dashboard-categories',
    dashboardService.getItemCategories,
    {
      refetchInterval: 60000, // Refetch every minute
    }
  );

  // Get monthly trends
  const {
    data: trends,
    isLoading: trendsLoading,
    error: trendsError,
  } = useQuery<TimeSeriesData[]>(
    'dashboard-trends',
    dashboardService.getMonthlyTrends,
    {
      refetchInterval: 300000, // Refetch every 5 minutes
    }
  );

  // Get recent activities
  const {
    data: activities,
    isLoading: activitiesLoading,
    error: activitiesError,
  } = useQuery(
    'dashboard-activities',
    dashboardService.getRecentActivities,
    {
      refetchInterval: 15000, // Refetch every 15 seconds
    }
  );

  // Get low stock alerts
  const {
    data: lowStockAlerts,
    isLoading: lowStockLoading,
    error: lowStockError,
  } = useQuery(
    'dashboard-low-stock',
    dashboardService.getLowStockAlerts,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  // Get pending requests
  const {
    data: pendingRequests,
    isLoading: pendingRequestsLoading,
    error: pendingRequestsError,
  } = useQuery(
    'dashboard-pending-requests',
    dashboardService.getPendingRequests,
    {
      refetchInterval: 20000, // Refetch every 20 seconds
    }
  );

  // Get delivery statistics
  const {
    data: deliveryStats,
    isLoading: deliveryStatsLoading,
    error: deliveryStatsError,
  } = useQuery(
    'dashboard-delivery-stats',
    dashboardService.getDeliveryStats,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  return {
    // Statistics
    stats: stats || {
      totalUsers: 0,
      totalItems: 0,
      activeBorrowed: 0,
      pendingDeliveries: 0,
      damagedItems: 0,
      lowStockItems: 0,
      totalCategories: 0,
      totalStores: 0,
      totalSuppliers: 0,
      pendingRequests: 0,
      completedDeliveries: 0,
      monthlyBorrows: 0,
      monthlyReturns: 0,
    },
    statsLoading,
    statsError,
    refetchStats,

    // Categories
    categories: categories || [],
    categoriesLoading,
    categoriesError,

    // Trends
    trends: trends || [],
    trendsLoading,
    trendsError,

    // Activities
    activities: activities || [],
    activitiesLoading,
    activitiesError,

    // Low stock alerts
    lowStockAlerts: lowStockAlerts || [],
    lowStockLoading,
    lowStockError,

    // Pending requests
    pendingRequests: pendingRequests || [],
    pendingRequestsLoading,
    pendingRequestsError,

    // Delivery stats
    deliveryStats: deliveryStats || {
      assigned: 0,
      inProgress: 0,
      completed: 0,
      pending: 0,
    },
    deliveryStatsLoading,
    deliveryStatsError,
  };
};
