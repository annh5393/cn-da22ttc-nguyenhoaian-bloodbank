import apiClient from '@/lib/axios';
import { NguoiHienMau, NguoiHienMauWithRelations, ApiResponse, PaginatedResponse } from '@/types/api.types';

export const nguoihienmauApi = {
  // Get all donors (with filters and pagination)
  async getAll(params?: { q?: string; blood?: string; status?: string; page?: number; pageSize?: number }): Promise<PaginatedResponse<NguoiHienMauWithRelations>> {
    const response = await apiClient.get<PaginatedResponse<NguoiHienMauWithRelations>>('/nguoihienmau', { params });
    return response.data;
  },

  // Get donor by ID
  async getById(id: string): Promise<NguoiHienMauWithRelations> {
    const response = await apiClient.get<NguoiHienMauWithRelations>(`/nguoihienmau/${id}`);
    return response.data;
  },

  // Create donor
  async create(data: Partial<NguoiHienMau>): Promise<NguoiHienMau> {
    const response = await apiClient.post<NguoiHienMau>('/nguoihienmau', data);
    return response.data;
  },

  // Update donor
  async update(id: string, data: Partial<NguoiHienMau>): Promise<NguoiHienMau> {
    const response = await apiClient.put<NguoiHienMau>(`/nguoihienmau/${id}`, data);
    return response.data;
  },

  // Delete donor
  async delete(id: string): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(`/nguoihienmau/${id}`);
    return response.data;
  },

  // Change password
  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<ApiResponse> {
    const response = await apiClient.put<ApiResponse>(`/nguoihienmau/${id}/change-password`, {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};
