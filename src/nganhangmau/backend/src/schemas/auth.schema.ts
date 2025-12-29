import { z } from 'zod';
import { EmailSchema } from './common.schema';

// Login schema - Email + password for staff, email only for donors
export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().optional(), // Optional because donors don't have password
  vaitro: z.enum(['Admin', 'Nhân viên y tế', 'Người hiến máu'], {
    message: 'Vai trò phải là Admin, Nhân viên y tế hoặc Người hiến máu'
  }).optional() // Optional because backend determines role from DB
});

// Register schema for donors
export const RegisterDonorSchema = z.object({
  hotennguoihien: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(100, 'Tên không được quá 100 ký tự'),
  ngaysinh: z.coerce.date(),
  gioitinh: z.enum(['Nam', 'Nữ', 'Khác'], {
    message: 'Giới tính phải là Nam, Nữ hoặc Khác'
  }),
  email: EmailSchema,
  sodienthoai: z.string().regex(/^0\d{9}$/, 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0'),
  diachi: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự').max(200, 'Địa chỉ không được quá 200 ký tự')
}).refine(
  (data) => {
    // Age must be at least 18 years old
    const age = new Date().getFullYear() - data.ngaysinh.getFullYear();
    return age >= 18;
  },
  {
    message: 'Người hiến phải từ 18 tuổi trở lên',
    path: ['ngaysinh']
  }
);

// Change password schema (if needed in future)
export const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Mật khẩu cũ không được để trống'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
}).refine(
  (data) => data.oldPassword !== data.newPassword,
  {
    message: 'Mật khẩu mới phải khác mật khẩu cũ',
    path: ['newPassword']
  }
);

// Reset password schema (if needed in future)
export const ResetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
});

// Type inference
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterDonorInput = z.infer<typeof RegisterDonorSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
