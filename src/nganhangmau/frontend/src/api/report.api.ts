import apiClient from '@/lib/axios';
import { DashboardStats, BloodInventory, ExpiringBag } from '@/types/api.types';

export const reportApi = {
  // Dashboard stats
  async getDashboard(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/reports/dashboard');
    return response.data;
  },

  // Blood inventory (available only)
  async getInventory(): Promise<BloodInventory[]> {
    const response = await apiClient.get<BloodInventory[]>('/reports/inventory');
    return response.data;
  },

  // Comprehensive inventory (all blood types including expired)
  async getComprehensiveInventory(): Promise<any[]> {
    const response = await apiClient.get('/reports/inventory/comprehensive');
    return response.data;
  },

  // Expiring blood
  async getExpiringBlood(days: number = 7): Promise<{ days: number; count: number; bags: ExpiringBag[] }> {
    const response = await apiClient.get(`/reports/inventory/expiring?days=${days}`);
    return response.data;
  },

  // Expired blood
  async getExpiredBlood(): Promise<{ count: number; bags: ExpiringBag[] }> {
    const response = await apiClient.get('/reports/inventory/expired');
    return response.data;
  },

  // Low stock alert
  async getLowStock(threshold: number = 10): Promise<{ threshold: number; lowStockTypes: BloodInventory[] }> {
    const response = await apiClient.get(`/reports/inventory/low-stock?threshold=${threshold}`);
    return response.data;
  },

  // Monthly report
  async getMonthlyReport(year: number, month: number): Promise<any> {
    const response = await apiClient.get(`/reports/monthly?year=${year}&month=${month}`);
    return response.data;
  },

  // Donor activity
  async getDonorActivity(startDate?: Date, endDate?: Date): Promise<any> {
    let url = '/reports/donors/activity';
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await apiClient.get(url);
    return response.data;
  },
};
