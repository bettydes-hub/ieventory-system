import axios from 'axios';
import {
  calculateDashboardStats,
  calculateItemCategories,
  calculateMonthlyTrends,
  getRecentActivities,
  getLowStockAlerts,
  getPendingRequests,
  getDeliveryStats,
} from './localDataService';

const API_BASE_URL = 'http://localhost:5001/api';

export interface DashboardStats {
  totalUsers: number;
  totalItems: number;
  activeBorrowed: number;
  pendingDeliveries: number;
  damagedItems: number;
  lowStockItems: number;
  totalCategories: number;
  totalStores: number;
  totalSuppliers: number;
  pendingRequests: number;
  completedDeliveries: number;
  monthlyBorrows: number;
  monthlyReturns: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  month: string;
  items: number;
  users: number;
  borrows: number;
  returns: number;
}

class DashboardService {
  private baseURL = API_BASE_URL;

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Try API first, fallback to local data
      const response = await axios.get(`${this.baseURL}/dashboard/stats`);
      return response.data;
    } catch (error) {
      console.log('API not available, using local data for dashboard stats');
      // Return calculated stats from local data
      return calculateDashboardStats();
    }
  }

  /**
   * Get item categories distribution
   */
  async getItemCategories(): Promise<ChartData[]> {
    try {
      const response = await axios.get(`${this.baseURL}/dashboard/categories`);
      return response.data;
    } catch (error) {
      console.log('API not available, using local data for categories');
      return calculateItemCategories();
    }
  }

  /**
   * Get monthly trends data
   */
  async getMonthlyTrends(): Promise<TimeSeriesData[]> {
    try {
      const response = await axios.get(`${this.baseURL}/dashboard/trends`);
      return response.data;
    } catch (error) {
      console.log('API not available, using local data for trends');
      return calculateMonthlyTrends();
    }
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/dashboard/activities`);
      return response.data;
    } catch (error) {
      console.log('API not available, using local data for activities');
      return getRecentActivities();
    }
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/dashboard/low-stock`);
      return response.data;
    } catch (error) {
      console.log('API not available, using local data for low stock alerts');
      return getLowStockAlerts();
    }
  }

  /**
   * Get pending requests
   */
  async getPendingRequests(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/dashboard/pending-requests`);
      return response.data;
    } catch (error) {
      console.log('API not available, using local data for pending requests');
      return getPendingRequests();
    }
  }

  /**
   * Get delivery statistics
   */
  async getDeliveryStats(): Promise<{
    assigned: number;
    inProgress: number;
    completed: number;
    pending: number;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/dashboard/delivery-stats`);
      return response.data;
    } catch (error) {
      console.log('API not available, using local data for delivery stats');
      return getDeliveryStats();
    }
  }
}

export const dashboardService = new DashboardService();
