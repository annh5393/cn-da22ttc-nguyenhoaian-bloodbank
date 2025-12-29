import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  getAllNguoiHienMau,
  getNguoiHienMauById,
  createNguoiHienMau,
  updateNguoiHienMau,
  deleteNguoiHienMau,
} from '../controllers/nguoihienmau.controller';
import { validateBody } from '../middleware/validate.middleware';
import { CreateNguoiHienSchema, UpdateNguoiHienSchema } from '../schemas/nguoihien.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', authorize('Nhân viên y tế', 'Admin'), getAllNguoiHienMau);
router.get('/:id', getNguoiHienMauById);
router.post('/', authorize('Nhân viên y tế', 'Admin'), validateBody(CreateNguoiHienSchema), createNguoiHienMau);
router.put('/:id', authorize('Nhân viên y tế', 'Admin'), validateBody(UpdateNguoiHienSchema), updateNguoiHienMau);
router.delete('/:id', authorize('Nhân viên y tế', 'Admin'), deleteNguoiHienMau);

export default router;
