import { z } from 'zod';
import {
  VietnameseNameSchema,
  EmailSchema,
  VietnamesePhoneSchema,
  PastDateSchema,
  GenderSchema,
  StaffIdSchema
} from './common.schema';

// Staff role enum
export const StaffRoleSchema = z.enum(['Admin', 'Nhân viên y tế'], {
  message: 'Vai trò phải là Admin hoặc Nhân viên y tế'
});

// Schema for creating a new staff member
export const CreateNhanVienSchema = z.object({
  manvyt: StaffIdSchema.optional(), // Auto-generated if not provided
  hotennvyt: VietnameseNameSchema,
  ngaysinh: PastDateSchema,
  gioitinh: GenderSchema,
  email: EmailSchema,
  sodienthoai: VietnamesePhoneSchema,
  vaitro: StaffRoleSchema,
  chuyenmon: z.string().min(2, 'Chuyên môn phải có ít nhất 2 ký tự').max(100, 'Chuyên môn không được quá 100 ký tự').optional().nullable()
}).refine(
  (data) => {
    // Age must be at least 18 years old
    const age = new Date().getFullYear() - data.ngaysinh.getFullYear();
    return age >= 18;
  },
  {
    message: 'Nhân viên phải từ 18 tuổi trở lên',
    path: ['ngaysinh']
  }
);

// Schema for updating a staff member
// Accept both `ngaysinh` and alias `ngaysinhnv` for backward/frontend compatibility
export const UpdateNhanVienSchema = z.object({
  hotennvyt: VietnameseNameSchema.optional(),
  ngaysinh: PastDateSchema.optional(),
  ngaysinhnv: PastDateSchema.optional(),
  gioitinh: GenderSchema.optional(),
  email: EmailSchema.optional(),
  sodienthoai: VietnamesePhoneSchema.optional(),
  vaitro: StaffRoleSchema.optional(),
  chuyenmon: z.string().min(2, 'Chuyên môn phải có ít nhất 2 ký tự').max(100, 'Chuyên môn không được quá 100 ký tự').optional().nullable()
}).refine(
  (data) => {
    const d = data.ngaysinhnv || data.ngaysinh;
    if (!d) return true;
    const age = new Date().getFullYear() - d.getFullYear();
    return age >= 18;
  },
  {
    message: 'Nhân viên phải từ 18 tuổi trở lên',
    path: ['ngaysinhnv']
  }
);

// Type inference
export type CreateNhanVienInput = z.infer<typeof CreateNhanVienSchema>;
export type UpdateNhanVienInput = z.infer<typeof UpdateNhanVienSchema>;
