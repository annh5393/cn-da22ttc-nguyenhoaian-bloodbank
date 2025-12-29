// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User & Auth types
export type UserRole = 'Admin' | 'NhanVienYTe' | 'NguoiHienMau';

export interface User {
  manvyt?: string;
  manguoihien?: string;
  hotennvyt?: string;
  hotennguoihien?: string;
  email?: string;
  vaitro: 'Admin' | 'Nhân viên y tế' | 'Người hiến máu';
  ngaysinh?: Date;
  gioitinh?: string;
  diachi?: string;
  sodienthoai?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Người hiến máu
export interface NguoiHienMau {
  manguoihien: string;
  hotennguoihien: string;
  ngaysinh?: Date;
  gioitinh?: string;
  diachi?: string;
  sodienthoai?: string;
  nhommau?: string;
  rhesus?: string;
  email?: string;
  passwordhash?: string;
  is_active?: boolean;
  created_at?: Date;
  trangthai?: string;
}

export interface NguoiHienMauWithRelations extends NguoiHienMau {
  phieuhienmau?: PhieuHienMau[];
  phieukham?: PhieuKham[];
  tuimau?: TuiMau[];
}

// Phiếu khám
export interface PhieuKham {
  maphieukham: string;
  manguoihien: string;
  manvyt: string;
  ghichu?: string;
  ngaykham?: Date;
  ketquasangloc?: string;
}

export interface PhieuKhamWithRelations extends PhieuKham {
  nguoihienmau?: NguoiHienMau;
  nhanvienyte?: User;
}

// Phiếu hiến máu
export interface PhieuHienMau {
  maphieuhien: string;
  manvyt: string;
  manguoihien: string;
  ngaytaophieuhien?: Date;
  luongmauhien?: number;
  trangthai?: string;
  hienlan?: string;
  // Request-only field to align FE selection with BE validation
  maphieukham?: string;
}

export interface PhieuHienMauWithRelations extends PhieuHienMau {
  nguoihienmau?: NguoiHienMau;
  nhanvienyte?: User;
}

// Túi máu
export interface TuiMau {
  matuimau: string;
  makho: string;
  manguoihien: string;
  thetich?: number;
  ngaynhapkho?: Date;
  hansudung?: Date;
  trangthai?: string;
}

export interface TuiMauWithRelations extends TuiMau {
  khomau?: KhoMau;
  nguoihienmau?: NguoiHienMau;
  vitrikho?: { mavitri: string; tenvitri: string };
  ngaynhap: string;

}

// Kho máu
export interface KhoMau {
  makho: string;
  tenvitri?: string;
  nhietdobaoquan?: string;
  trangthai?: string;
}

export interface KhoMauWithRelations extends KhoMau {
  tuimau?: TuiMauWithRelations[];
  phutrach?: PhuTrachWithRelations[];
}

// Phụ trách kho
export interface PhuTrach {
  manvyt: string;
  makho: string;
  ngayphutrach?: Date;
}

export interface PhuTrachWithRelations extends PhuTrach {
  nhanvienyte?: User;
}

// Report types
export interface DashboardStats {
  totalDonors: number;
  totalStaff: number;
  totalBags: number;
  availableBags: number;
  expiringBags: number;
  todayDonations: number;
}

export interface BloodInventory {
  nhommau: string;
  rhesus: string;
  count: number;
  totalVolume: number;
}

export interface ExpiringBag extends TuiMauWithRelations {
  daysUntilExpiry: number;
}
