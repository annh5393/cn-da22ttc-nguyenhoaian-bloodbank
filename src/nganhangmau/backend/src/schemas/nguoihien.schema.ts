import { z } from 'zod';
import {
  VietnameseNameSchema,
  EmailSchema,
  VietnamesePhoneSchema,
  PastDateSchema,
  GenderSchema,
  BloodTypeSchema,
  RhesusSchema,
  DonorStatusSchema,
  DonorIdSchema
} from './common.schema';

// Schema for creating a new donor
export const CreateNguoiHienSchema = z.object({
  manguoihien: DonorIdSchema.optional(), // Auto-generated if not provided
  hotennguoihien: VietnameseNameSchema,
  ngaysinh: PastDateSchema,
  gioitinh: GenderSchema,
  email: EmailSchema,
  diachi: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự').max(200, 'Địa chỉ không được quá 200 ký tự'),
  sodienthoai: VietnamesePhoneSchema,
  nhommau: BloodTypeSchema.optional().nullable(),
  rhesus: RhesusSchema.optional().nullable(),
  trangthai: DonorStatusSchema.optional().default('Hoạt động')
}).refine(
  (data) => {
    // If nhommau is provided, rhesus must also be provided
    if (data.nhommau && !data.rhesus) return false;
    if (data.rhesus && !data.nhommau) return false;
    return true;
  },
  {
    message: 'Nhóm máu và Rhesus phải được cung cấp cùng nhau',
    path: ['nhommau']
  }
).refine(
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

// Schema for updating a donor
export const UpdateNguoiHienSchema = CreateNguoiHienSchema.partial().omit({ manguoihien: true });

// Schema for updating blood type (after test results)
export const UpdateBloodTypeSchema = z.object({
  nhommau: BloodTypeSchema,
  rhesus: RhesusSchema
});

// Type inference
export type CreateNguoiHienInput = z.infer<typeof CreateNguoiHienSchema>;
export type UpdateNguoiHienInput = z.infer<typeof UpdateNguoiHienSchema>;
export type UpdateBloodTypeInput = z.infer<typeof UpdateBloodTypeSchema>;
