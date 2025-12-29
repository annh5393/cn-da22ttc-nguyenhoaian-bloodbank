import apiClient from '@/lib/axios';
import { PhieuHienMau, PhieuHienMauWithRelations, ApiResponse } from '@/types/api.types';

export const phieuhienmauApi = {
  async getAll(): Promise<PhieuHienMauWithRelations[]> {
    const response = await apiClient.get<PhieuHienMauWithRelations[]>('/phieuhienmau');
    return response.data;
  },

  async getById(id: string): Promise<PhieuHienMauWithRelations> {
    const response = await apiClient.get<PhieuHienMauWithRelations>(`/phieuhienmau/${id}`);
    return response.data;
  },

  async create(data: Partial<PhieuHienMau>): Promise<PhieuHienMau> {
    try {
      const response = await apiClient.post<PhieuHienMau>('/phieuhienmau', data);
      return response.data;
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Tạo phiếu hiến máu thất bại';
      throw new Error(message);
    }
  },

  async update(id: string, data: Partial<PhieuHienMau>): Promise<PhieuHienMau> {
    try {
      const response = await apiClient.put<PhieuHienMau>(`/phieuhienmau/${id}`, data);
      return response.data;
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Cập nhật phiếu hiến máu thất bại';
      throw new Error(message);
    }
  },

  async confirmLabResult(id: string, payload: { nhommau: 'O'|'A'|'B'|'AB'; rhesus: '+'|'-' }): Promise<PhieuHienMauWithRelations> {
    const response = await apiClient.patch<PhieuHienMauWithRelations>(`/phieuhienmau/${id}/xet-nghiem`, payload);
    return response.data;
  },

  async delete(id: string): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(`/phieuhienmau/${id}`);
    return response.data;
  },
};
