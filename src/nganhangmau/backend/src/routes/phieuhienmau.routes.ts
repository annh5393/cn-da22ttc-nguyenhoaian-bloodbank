import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  getAllPhieuHienMau,
  getPhieuHienMauById,
  createPhieuHienMau,
  updatePhieuHienMau,
  confirmXetNghiem,
} from '../controllers/phieuhienmau.controller';
import { validateBody } from '../middleware/validate.middleware';
import { CreatePhieuHienSchema, UpdatePhieuHienSchema, UpdateBloodTypeSchema } from '../schemas/phieuhien.schema';

const router = Router();

router.use(authenticate);

// All staff can view
router.get('/', getAllPhieuHienMau);
router.get('/:id', getPhieuHienMauById);

// Staff can create/update donation records
// Chỉ Nhân viên y tế được phép tạo/cập nhật/xóa
router.post('/', authorize('Nhân viên y tế'), validateBody(CreatePhieuHienSchema), createPhieuHienMau);
router.put('/:id', authorize('Nhân viên y tế'), validateBody(UpdatePhieuHienSchema), updatePhieuHienMau);
router.patch('/:id/xet-nghiem', authorize('Nhân viên y tế'), validateBody(UpdateBloodTypeSchema), confirmXetNghiem);

export default router;
