import { z } from 'zod';
import {
  PhieuKhamIdSchema,
  DonorIdSchema,
  StaffIdSchema
} from './common.schema';

// Screening result enum
export const KetQuaSangLocSchema = z.enum(['Đạt', 'Không đạt', 'Chờ xử lý'], {
  errorMap: () => ({ message: 'Kết quả sàng lọc phải là Đạt, Không đạt hoặc Chờ xử lý' })
});

// Schema for creating a new medical examination
export const CreatePhieuKhamSchema = z.object({
  maphieukham: PhieuKhamIdSchema.optional(), // Auto-generated if not provided
  manguoihien: DonorIdSchema,
  manvyt: StaffIdSchema,
  ngaykham: z.coerce.date(),
  ketquasangloc: KetQuaSangLocSchema.optional().nullable(),
  ghichu: z.string().max(500, 'Ghi chú không được quá 500 ký tự').optional().nullable()
}).refine(
  (data) => {
    // Examination date cannot be in the future
    return data.ngaykham <= new Date();
  },
  {
    message: 'Ngày khám không được trong tương lai',
    path: ['ngaykham']
  }
);

// Schema for updating a medical examination
export const UpdatePhieuKhamSchema = z.object({
  manguoihien: DonorIdSchema.optional(),
  manvyt: StaffIdSchema.optional(),
  ngaykham: z.coerce.date().optional(),
  ketquasangloc: KetQuaSangLocSchema.optional().nullable(),
  ghichu: z.string().max(500, 'Ghi chú không được quá 500 ký tự').optional().nullable()
});

// Schema for updating screening result only
export const UpdateKetQuaSangLocSchema = z.object({
  ketquasangloc: KetQuaSangLocSchema
});

// Type inference
export type CreatePhieuKhamInput = z.infer<typeof CreatePhieuKhamSchema>;
export type UpdatePhieuKhamInput = z.infer<typeof UpdatePhieuKhamSchema>;
export type UpdateKetQuaSangLocInput = z.infer<typeof UpdateKetQuaSangLocSchema>;
