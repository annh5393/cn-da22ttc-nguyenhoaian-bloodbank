import { z } from 'zod';

// Blood type enums
export const BloodTypeSchema = z.enum(['A', 'B', 'O', 'AB'], {
  message: 'Nhóm máu phải là A, B, O hoặc AB'
});

export const RhesusSchema = z.enum(['Dương', 'Âm', 'DUONG', 'AM', '+', '-'], {
  message: 'Rhesus phải là Dương/Âm hoặc +/-'
});

// Gender enum
export const GenderSchema = z.enum(['Nam', 'Nữ', 'Khác'], {
  message: 'Giới tính phải là Nam, Nữ hoặc Khác'
});

// Status enums
export const DonorStatusSchema = z.enum([
  'Hoạt động', 
  'HOAT_DONG', 
  'Ngưng hoạt động', 
  'NGƯNG HOẠT ĐỘNG'
], {
  message: 'Trạng thái không hợp lệ'
});

export const BagStatusSchema = z.enum(['CON_HAN', 'SAP_HET_HAN', 'HET_HAN', 'DA_DUNG', 'HUY'], {
  message: 'Trạng thái túi máu không hợp lệ'
});

export const PhieuHienStatusSchema = z.enum(['CREATED', 'COLLECTED', 'STORED', 'CANCELED'], {
  message: 'Trạng thái phiếu hiến không hợp lệ'
});

// Common field validators
export const VietnamesePhoneSchema = z.string()
  .regex(/^0\d{9}$/, 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0');

export const EmailSchema = z.string()
  .email('Email không hợp lệ')
  .toLowerCase();

export const VietnameseNameSchema = z.string()
  .min(2, 'Tên phải có ít nhất 2 ký tự')
  .max(100, 'Tên không được quá 100 ký tự')
  .regex(/^[\p{L}\s]+$/u, 'Tên chỉ được chứa chữ cái và khoảng trắng');

// Date validators
export const PastDateSchema = z.coerce.date()
  .max(new Date(), 'Ngày không được trong tương lai');

export const FutureDateSchema = z.coerce.date()
  .min(new Date(), 'Ngày phải trong tương lai');

// ID validators
export const DonorIdSchema = z.string()
  .regex(/^NH\d+$/, 'Mã người hiến phải bắt đầu bằng NH theo sau là số');

export const StaffIdSchema = z.string()
  .regex(/^NV\d+$/, 'Mã nhân viên phải bắt đầu bằng NV theo sau là số');

export const PhieuKhamIdSchema = z.string()
  .regex(/^PK\d+$/, 'Mã phiếu khám phải bắt đầu bằng PK theo sau là số');

export const PhieuHienIdSchema = z.string()
  .regex(/^PH\d+$/, 'Mã phiếu hiến phải bắt đầu bằng PH theo sau là số');

export const BagIdSchema = z.string()
  .regex(/^TM\d+$/, 'Mã túi máu phải bắt đầu bằng TM theo sau là số');

// Accept numeric IDs (e.g. KHO001) and named main warehouse (KHO_MAIN)
export const WarehouseIdSchema = z.string()
  .regex(/^KHO(_[A-Z]+|\d+)$/, 'Mã kho phải bắt đầu bằng KHO theo sau là số hoặc tên nội bộ (ví dụ: KHO_MAIN)');

export const PositionIdSchema = z.string()
  .regex(/^VT\d+$/, 'Mã vị trí phải bắt đầu bằng VT theo sau là số');

// Helper functions to normalize status values
export const normalizeDonorStatus = (status: string): string => {
  const normalized = status.trim().toUpperCase().replace(/\s+/g, '_');
  
  if (normalized === 'HOAT_DONG' || normalized === 'HOẠT_ĐỘNG') {
    return 'HOAT_DONG';
  }
  if (normalized === 'NGUNG_HOAT_DONG' || normalized === 'NGƯNG_HOẠT_ĐỘNG') {
    return 'NGUNG_HOAT_DONG';
  }
  if (normalized === 'TAM_NGUNG' || normalized === 'TẠM_NGƯNG') {
    return 'TAM_NGUNG';
  }
  
  return status; // Return original if no match
};

export const normalizeRhesus = (rhesus: string): '+' | '-' => {
  const normalized = rhesus.toLowerCase().trim();
  if (normalized === 'dương' || normalized === 'duong' || normalized === '+') {
    return '+';
  }
  if (normalized === 'âm' || normalized === 'am' || normalized === '-') {
    return '-';
  }
  return rhesus as '+' | '-';
};
