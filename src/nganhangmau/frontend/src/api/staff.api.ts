import apiClient from '@/lib/axios';

export interface StaffAccount {
  manvyt: string;
  hotennvyt: string;
  email: string;
  vaitro: 'Admin' | 'Nhân viên y tế';
  ngaysinh?: string;
  gioitinh?: string;
  diachi?: string;
  sodienthoai?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface CreateStaffRequest {
  manvyt: string; // Staff ID is required
  hotennvyt: string;
  email: string;
  password?: string; // Optional - will generate temp password if not provided
  vaitro?: 'Admin' | 'Nhân viên y tế';
  ngaysinh?: string;
  gioitinh?: string;
  diachi?: string;
  sodienthoai?: string;
}

export interface UpdateStaffRequest {
  hotennvyt?: string;
  email?: string;
  password?: string; // Optional - to change password
  vaitro?: 'Admin' | 'Nhân viên y tế';
  ngaysinh?: string;
  gioitinh?: string;
  diachi?: string;
  sodienthoai?: string;
}

// Get all staff accounts
export const getAllStaff = async (): Promise<StaffAccount[]> => {
  const response = await apiClient.get('/admin/staff');
  return response.data;
};

// Create staff account
export const createStaffAccount = async (data: CreateStaffRequest) => {
  const payload: any = {
    manvyt: data.manvyt,
    hotennvyt: data.hotennvyt,
    email: data.email,
    vaitro: data.vaitro,
  };
  
  // Add password if provided (otherwise backend will generate temp password)
  if (data.password) {
    payload.password = data.password;
  }
  
  // Only add optional fields if they have values
  if (data.ngaysinh) {
    payload.ngaysinh = new Date(data.ngaysinh).toISOString();
  }
  if (data.gioitinh) {
    payload.gioitinh = data.gioitinh;
  }
  if (data.diachi) {
    payload.diachi = data.diachi;
  }
  if (data.sodienthoai) {
    payload.sodienthoai = data.sodienthoai;
  }

  const response = await apiClient.post('/admin/staff', payload);
  return response.data;
};

// Update staff account
export const updateStaffAccount = async (manvyt: string, data: UpdateStaffRequest) => {
  // Build payload only with provided fields
  const payload: any = {};
  
  if (data.hotennvyt) payload.hotennvyt = data.hotennvyt;
  if (data.email) payload.email = data.email;
  if (data.password) payload.password = data.password; // Include password if provided
  if (data.vaitro) payload.vaitro = data.vaitro;
  if (data.ngaysinh) payload.ngaysinh = new Date(data.ngaysinh).toISOString();
  if (data.gioitinh) payload.gioitinh = data.gioitinh;
  if (data.diachi) payload.diachi = data.diachi;
  if (data.sodienthoai) payload.sodienthoai = data.sodienthoai;

  const response = await apiClient.put(`/admin/staff/${manvyt}`, payload);
  return response.data;
};

// Update own staff profile (non-admin)
export const updateOwnStaffProfile = async (manvyt: string, data: UpdateStaffRequest) => {
  const payload: any = {};
  if (data.hotennvyt) payload.hotennvyt = data.hotennvyt;
  if (data.email) payload.email = data.email;
  if (data.ngaysinh) payload.ngaysinhnv = new Date(data.ngaysinh).toISOString();
  if (data.gioitinh) payload.gioitinh = data.gioitinh;
  if (data.diachi) payload.diachi = data.diachi;
  if (data.sodienthoai) payload.sodienthoai = data.sodienthoai;
  // Do NOT allow changing role or password here

  const response = await apiClient.put(`/nhanvienyte/${manvyt}`, payload);
  return response.data;
};

// Delete staff account
export const deleteStaffAccount = async (manvyt: string) => {
  const response = await apiClient.delete(`/admin/staff/${manvyt}`);
  return response.data;
};

// Set staff active status (Admin only)
export const setStaffStatus = async (manvyt: string, is_active: boolean) => {
  const response = await apiClient.patch(`/admin/nhanvien/${manvyt}/status`, { is_active });
  return response.data;
};
