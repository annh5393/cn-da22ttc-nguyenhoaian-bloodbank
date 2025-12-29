import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  getAllPhieuKham,
  getPhieuKhamById,
  createPhieuKham,
  updatePhieuKham,
} from '../controllers/phieukham.controller';
import { validateBody } from '../middleware/validate.middleware';
import { CreatePhieuKhamSchema, UpdatePhieuKhamSchema } from '../schemas/phieukham.schema';

const router = Router();

router.use(authenticate);

// All staff can view
router.get('/', getAllPhieuKham);
router.get('/:id', getPhieuKhamById);

// Staff can create/update health checks
// Chỉ Nhân viên y tế được phép tạo/cập nhật/xóa
router.post('/', authorize('Nhân viên y tế'), validateBody(CreatePhieuKhamSchema), createPhieuKham);
router.put('/:id', authorize('Nhân viên y tế'), validateBody(UpdatePhieuKhamSchema), updatePhieuKham);

export default router;
