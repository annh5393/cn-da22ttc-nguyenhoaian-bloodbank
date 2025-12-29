/**
 * VÍ DỤ: Áp dụng Zod validation vào routes phiếu hiến
 * 
 * Cách sử dụng:
 * 1. Import schemas và middleware
 * 2. Thêm validateBody() vào route trước controller
 * 3. Controller nhận data đã được validate và type-safe
 */

import { Router } from 'express';
import { validateBody } from '../middleware/validate.middleware';
import { CreatePhieuHienSchema, UpdatePhieuHienSchema } from '../schemas/phieuhien.schema';
import { authenticate, requireRole } from '../middlewares/auth';

const router = Router();

// VÍ DỤ: Route tạo phiếu hiến với Zod validation
router.post(
  '/phieu-hien',
  authenticate,
  requireRole(['Nhân viên y tế']),
  validateBody(CreatePhieuHienSchema), // <-- Zod validation middleware
  async (req, res, next) => {
    try {
      // req.body đã được validate và có type-safe
      // TypeScript biết chính xác structure của req.body
      const {
        manguoihien,
        maphieukham,
        ngaytaophieuhien,
        luongmauhien,
        diadiem,
        ghichu
      } = req.body; // All fields are type-safe!

      // Không cần validate nữa, Zod đã làm rồi:
      // ✅ manguoihien: string, format NH + số
      // ✅ maphieukham: string, format PK + số
      // ✅ ngaytaophieuhien: Date object (đã convert)
      // ✅ luongmauhien: number, 200-500, bội số 50
      // ✅ diadiem: string | null | undefined
      // ✅ ghichu: string | null | undefined

      // Business logic ở đây...
      // const result = await phieuHienService.create(req.body);

      res.json({
        message: 'Tạo phiếu hiến thành công',
        // data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

// VÍ DỤ: Route cập nhật phiếu hiến
router.put(
  '/phieu-hien/:id',
  authenticate,
  requireRole(['Nhân viên y tế']),
  validateBody(UpdatePhieuHienSchema), // <-- Zod validation
  async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // req.body đã được validate
      // Chỉ các field được gửi lên mới có trong req.body (partial update)
      
      // Business logic...
      // const result = await phieuHienService.update(id, req.body);

      res.json({
        message: 'Cập nhật phiếu hiến thành công',
        // data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

/**
 * LỢI ÍCH:
 * 
 * 1. Code ngắn gọn hơn:
 *    - Không cần if (!field) return res.status(400)...
 *    - Không cần typeof checks
 *    - Không cần regex validation
 * 
 * 2. Type-safe:
 *    - TypeScript biết chính xác type của mỗi field
 *    - Autocomplete hoạt động tốt
 *    - Catch lỗi ngay khi code
 * 
 * 3. Error messages rõ ràng:
 *    - Frontend nhận được lỗi chi tiết từng field
 *    - Dễ hiển thị lỗi cho user
 * 
 * 4. Reusable:
 *    - Schema dùng chung frontend + backend
 *    - Validation logic ở 1 chỗ
 * 
 * 5. Maintainable:
 *    - Thay đổi validation ở schema
 *    - Tất cả routes tự động update
 */
