import apiClient from '@/lib/axios';
import { PhieuKham, PhieuKhamWithRelations, ApiResponse } from '@/types/api.types';

export const phieukhamApi = {
  async getAll(): Promise<PhieuKhamWithRelations[]> {
    const response = await apiClient.get<PhieuKhamWithRelations[]>('/phieukham');
    return response.data;
  },

  async getById(id: string): Promise<PhieuKhamWithRelations> {
    const response = await apiClient.get<PhieuKhamWithRelations>(`/phieukham/${id}`);
    return response.data;
  },

  async create(data: Partial<PhieuKham>): Promise<PhieuKham> {
    const response = await apiClient.post<PhieuKham>('/phieukham', data);
    return response.data;
  },

  async update(id: string, data: Partial<PhieuKham>): Promise<PhieuKham> {
    const response = await apiClient.put<PhieuKham>(`/phieukham/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(`/phieukham/${id}`);
    return response.data;
  },
};
