import apiClient from '@/lib/axios';
import { KhoMau, KhoMauWithRelations, ApiResponse } from '@/types/api.types';

export const khomauApi = {
  async getAll(): Promise<KhoMauWithRelations[]> {
    const response = await apiClient.get<KhoMauWithRelations[]>('/khomau');
    return response.data;
  },

  async getById(id: string): Promise<KhoMauWithRelations> {
    const response = await apiClient.get<KhoMauWithRelations>(`/khomau/${id}`);
    return response.data;
  },

  async create(data: Partial<KhoMau>): Promise<KhoMau> {
    const response = await apiClient.post<KhoMau>('/khomau', data);
    return response.data;
  },

  async update(id: string, data: Partial<KhoMau>): Promise<KhoMau> {
    const response = await apiClient.put<KhoMau>(`/khomau/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(`/khomau/${id}`);
    return response.data;
  },

  // Assign staff to warehouse
  async assignStaff(data: { makho: string; manvyt: string; ngayphutrach?: Date }): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>('/khomau/assign', data);
    return response.data;
  },

  // Remove staff from warehouse
  async removeStaff(data: { makho: string; manvyt: string }): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>('/khomau/assign', { data });
    return response.data;
  },
};
