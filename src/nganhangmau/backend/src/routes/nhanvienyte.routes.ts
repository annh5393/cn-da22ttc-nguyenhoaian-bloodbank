import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  getAllNhanVienYTe,
  getNhanVienYTeById,
  createNhanVienYTe,
  updateNhanVienYTe,
  deleteNhanVienYTe,
} from '../controllers/nhanvienyte.controller';
import { validateBody } from '../middleware/validate.middleware';
import { CreateNhanVienSchema, UpdateNhanVienSchema } from '../schemas/nhanvien.schema';

const router = Router();

router.use(authenticate);

router.get('/', authorize('Admin'), getAllNhanVienYTe);
// Allow admin to view anyone; staff can view their own via controller check
router.get('/:id', getNhanVienYTeById);
router.post('/', authorize('Admin'), validateBody(CreateNhanVienSchema), createNhanVienYTe);
// Allow Admin to update any; allow staff to update their own basic profile
router.put('/:id', validateBody(UpdateNhanVienSchema), updateNhanVienYTe);
router.delete('/:id', authorize('Admin'), deleteNhanVienYTe);

export default router;
