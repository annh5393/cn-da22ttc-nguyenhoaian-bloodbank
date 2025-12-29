import apiClient from '@/lib/axios';
import { LoginRequest, LoginResponse, User, ApiResponse } from '@/types/api.types';

// Login
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
  return response.data;
};

// Register donor
export const register = async (data: Partial<User> & { password?: string }): Promise<ApiResponse<User>> => {
  // Map frontend fields to backend donor registration fields matching RegisterDonorSchema
  const payload = {
    email: data.email,
    hotennguoihien: data.hotennvyt || (data as any).hotennguoihien,
    sodienthoai: data.sodienthoai,
    ngaysinh: data.ngaysinh ? new Date(data.ngaysinh).toISOString() : undefined,
    gioitinh: data.gioitinh,
    diachi: data.diachi,
  };
  const response = await apiClient.post<ApiResponse<User>>('/auth/register', payload);
  return response.data;
};

// Get current user profile
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};

// Logout (client-side only)
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/auth/account?mode=login';
};
