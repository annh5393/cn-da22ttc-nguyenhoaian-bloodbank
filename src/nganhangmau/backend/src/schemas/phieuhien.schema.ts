import { z } from 'zod';
import {
  DonorIdSchema,
  PhieuKhamIdSchema,
  PhieuHienIdSchema,
  PhieuHienStatusSchema
} from './common.schema';

// Schema for creating a new donation record
export const CreatePhieuHienSchema = z.object({
  maphieuhien: PhieuHienIdSchema.optional(), // Auto-generated if not provided
  manguoihien: DonorIdSchema,
  maphieukham: PhieuKhamIdSchema,
  ngaytaophieuhien: z.coerce.date(),
  luongmauhien: z.number()
    .int('Lượng máu phải là số nguyên')
    .min(200, 'Lượng máu tối thiểu 200ml')
    .max(500, 'Lượng máu tối đa 500ml'),
  diadiem: z.string().max(200, 'Địa điểm không được quá 200 ký tự').optional().nullable(),
  ghichu: z.string().max(500, 'Ghi chú không được quá 500 ký tự').optional().nullable(),
  trangthai: PhieuHienStatusSchema.optional().default('CREATED')
}).refine(
  (data) => data.luongmauhien % 50 === 0,
  {
    message: 'Lượng máu phải là bội số của 50ml (200, 250, 300, 350, 400, 450, 500)',
    path: ['luongmauhien']
  }
).refine(
  (data) => {
    // Donation date cannot be in the future
    return data.ngaytaophieuhien <= new Date();
  },
  {
    message: 'Ngày hiến máu không được trong tương lai',
    path: ['ngaytaophieuhien']
  }
);

// Schema for updating a donation record
export const UpdatePhieuHienSchema = z.object({
  manguoihien: DonorIdSchema.optional(),
  maphieukham: PhieuKhamIdSchema.optional(),
  ngaytaophieuhien: z.coerce.date().optional(),
  luongmauhien: z.number()
    .int('Lượng máu phải là số nguyên')
    .min(200, 'Lượng máu tối thiểu 200ml')
    .max(500, 'Lượng máu tối đa 500ml')
    .optional(),
  diadiem: z.string().max(200, 'Địa điểm không được quá 200 ký tự').optional().nullable(),
  ghichu: z.string().max(500, 'Ghi chú không được quá 500 ký tự').optional().nullable(),
  trangthai: PhieuHienStatusSchema.optional()
}).refine(
  (data) => {
    if (data.luongmauhien && data.luongmauhien % 50 !== 0) return false;
    return true;
  },
  {
    message: 'Lượng máu phải là bội số của 50ml',
    path: ['luongmauhien']
  }
);

// Schema for updating status only
export const UpdatePhieuHienStatusSchema = z.object({
  trangthai: PhieuHienStatusSchema
});

// Type inference
export type CreatePhieuHienInput = z.infer<typeof CreatePhieuHienSchema>;
export type UpdatePhieuHienInput = z.infer<typeof UpdatePhieuHienSchema>;
export type UpdatePhieuHienStatusInput = z.infer<typeof UpdatePhieuHienStatusSchema>;

// Re-export UpdateBloodTypeSchema from nguoihien for xet nghiem
export { UpdateBloodTypeSchema } from './nguoihien.schema';
export type { UpdateBloodTypeInput } from './nguoihien.schema';
