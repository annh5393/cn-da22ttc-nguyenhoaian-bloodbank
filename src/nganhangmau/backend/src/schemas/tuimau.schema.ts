import { z } from 'zod';
import {
  BagIdSchema,
  WarehouseIdSchema,
  PositionIdSchema,
  DonorIdSchema,
  BagStatusSchema,
  FutureDateSchema
} from './common.schema';

// Schema for creating a new blood bag
export const CreateTuiMauSchema = z.object({
  matuimau: BagIdSchema.optional(), // Auto-generated if not provided
  makho: WarehouseIdSchema,
  // Frontend sends a VIRTUAL position code (e.g. VT_AB_DUONG) for validation only
  // Do not use PositionIdSchema (VT\d+) here
  mavitri: z
    .string()
    .regex(/^VT_(A|B|O|AB)_(DUONG|AM)$/i, 'Mã vị trí phải dạng VT_{A|B|O|AB}_{DUONG|AM}')
    .optional()
    .nullable(),
  manguoihien: DonorIdSchema,
  thetich: z.number()
    .int('Thể tích phải là số nguyên')
    .min(200, 'Thể tích tối thiểu 200ml')
    .max(500, 'Thể tích tối đa 500ml'),
  ngaynhapkho: z.coerce.date().optional().default(() => new Date()),
  // Backend computes hạn sử dụng (ngày nhập + 35) nếu không cung cấp
  hansudung: FutureDateSchema.optional(),
  trangthai: BagStatusSchema.optional().default('CON_HAN')
}).refine(
  (data) => data.thetich % 50 === 0,
  {
    message: 'Thể tích phải là bội số của 50ml (200, 250, 300, 350, 400, 450, 500)',
    path: ['thetich']
  }
).refine(
  (data) => {
    // Expiry date must be at least 7 days from now if provided
    if (!data.hansudung) return true;
    const minExpiry = new Date();
    minExpiry.setDate(minExpiry.getDate() + 7);
    return data.hansudung >= minExpiry;
  },
  {
    message: 'Hạn sử dụng phải ít nhất 7 ngày kể từ hôm nay',
    path: ['hansudung']
  }
);

// Schema for updating a blood bag
export const UpdateTuiMauSchema = z.object({
  makho: WarehouseIdSchema.optional(),
  // VIRTUAL position code validation (same format as create)
  mavitri: z
    .string()
    .regex(/^VT_(A|B|O|AB)_(DUONG|AM)$/i, 'Mã vị trí phải dạng VT_{A|B|O|AB}_{DUONG|AM}')
    .optional()
    .nullable(),
  thetich: z.number()
    .int('Thể tích phải là số nguyên')
    .min(200, 'Thể tích tối thiểu 200ml')
    .max(500, 'Thể tích tối đa 500ml')
    .optional(),
  // Backend may recompute hạn sử dụng từ ngày nhập kho
  hansudung: FutureDateSchema.optional(),
  trangthai: BagStatusSchema.optional()
}).refine(
  (data) => {
    if (data.thetich && data.thetich % 50 !== 0) return false;
    return true;
  },
  {
    message: 'Thể tích phải là bội số của 50ml',
    path: ['thetich']
  }
);

// Schema for updating status only (for medical compliance)
export const UpdateTuiMauStatusSchema = z.object({
  trangthai: z.enum(['DA_DUNG', 'HET_HAN', 'HUY'], {
    message: 'Chỉ được chuyển sang trạng thái: Đã dùng, Hết hạn, hoặc Hủy'
  })
});

// Schema for moving bag to different position
export const MoveTuiMauSchema = z.object({
  makho: WarehouseIdSchema,
  mavitri: PositionIdSchema.optional().nullable()
});

// Type inference
export type CreateTuiMauInput = z.infer<typeof CreateTuiMauSchema>;
export type UpdateTuiMauInput = z.infer<typeof UpdateTuiMauSchema>;
export type UpdateTuiMauStatusInput = z.infer<typeof UpdateTuiMauStatusSchema>;
export type MoveTuiMauInput = z.infer<typeof MoveTuiMauSchema>;
