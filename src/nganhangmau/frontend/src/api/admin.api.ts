import apiClient from '@/lib/axios';

export const adminApi = {
  // Set donor active status
  async setDonorStatus(manguoihien: string, is_active: boolean) {
    const response = await apiClient.patch(`/admin/nguoihien/${manguoihien}/status`, { is_active });
    return response.data;
  },

  // Reset donor password
  async resetDonorPassword(manguoihien: string) {
    const response = await apiClient.post(`/admin/nguoihien/${manguoihien}/reset-password`);
    return response.data;
  },

  // Set staff active status
  async setStaffStatus(manvyt: string, is_active: boolean) {
    const response = await apiClient.patch(`/admin/nhanvien/${manvyt}/status`, { is_active });
    return response.data;
  },

  // Reset staff password
  async resetStaffPassword(manvyt: string) {
    const response = await apiClient.post(`/admin/nhanvien/${manvyt}/reset-password`);
    return response.data;
  },
};
