import { z } from 'zod';
import { WarehouseIdSchema, StaffIdSchema } from './common.schema';

// Schema for creating a warehouse
export const CreateKhoMauSchema = z.object({
  makho: WarehouseIdSchema.optional(), // Auto-generated if not provided
  tenkho: z.string().min(2, 'Tên kho phải có ít nhất 2 ký tự').max(100, 'Tên kho không được quá 100 ký tự'),
  vitri: z.string().min(5, 'Vị trí phải có ít nhất 5 ký tự').max(200, 'Vị trí không được quá 200 ký tự'),
  succhua: z.number().int('Sức chứa phải là số nguyên').min(1, 'Sức chứa phải lớn hơn 0').optional().nullable()
});

// Schema for updating a warehouse
export const UpdateKhoMauSchema = CreateKhoMauSchema.partial().omit({ makho: true });

// Schema for assigning staff to warehouse
export const AssignStaffSchema = z.object({
  makho: WarehouseIdSchema,
  manvyt: StaffIdSchema
});

// Schema for removing staff from warehouse
export const RemoveStaffSchema = z.object({
  makho: WarehouseIdSchema,
  manvyt: StaffIdSchema
});

// Type inference
export type CreateKhoMauInput = z.infer<typeof CreateKhoMauSchema>;
export type UpdateKhoMauInput = z.infer<typeof UpdateKhoMauSchema>;
export type AssignStaffInput = z.infer<typeof AssignStaffSchema>;
export type RemoveStaffInput = z.infer<typeof RemoveStaffSchema>;
