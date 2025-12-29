import apiClient from '@/lib/axios';
import { TuiMau, TuiMauWithRelations, ApiResponse } from '@/types/api.types';

export const tuimauApi = {
  async getAll(): Promise<TuiMauWithRelations[]> {
    const response = await apiClient.get<TuiMauWithRelations[]>('/tuimau');
    return response.data;
  },

  async getById(id: string): Promise<TuiMauWithRelations> {
    const response = await apiClient.get<TuiMauWithRelations>(`/tuimau/${id}`);
    return response.data;
  },

  async create(data: Partial<TuiMau>): Promise<TuiMau> {
    const response = await apiClient.post<TuiMau>('/tuimau', data);
    return response.data;
  },

  async update(id: string, data: Partial<TuiMau>): Promise<TuiMau> {
    const response = await apiClient.put<TuiMau>(`/tuimau/${id}`, data);
    return response.data;
  },

  async updateStatus(id: string, data: { trangthai: string }): Promise<TuiMau> {
    const response = await apiClient.patch<TuiMau>(`/tuimau/${id}/status`, data);
    return response.data;
  },

  async delete(id: string): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(`/tuimau/${id}`);
    return response.data;
  },
};
