import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  getAllTuiMau,
  getTuiMauById,
  createTuiMau,
  updateTuiMau,
  updateBagStatus,
  getPositionSummary,
  getBagsByPosition,
} from '../controllers/tuimau.controller';
import { validateBody } from '../middleware/validate.middleware';
import { CreateTuiMauSchema, UpdateTuiMauSchema, UpdateTuiMauStatusSchema } from '../schemas/tuimau.schema';

const router = Router();

router.use(authenticate);

// Positions endpoints should come before :id to avoid route conflicts
router.get('/positions/summary', authorize('Nhân viên y tế', 'Admin'), getPositionSummary);
router.get('/positions/:mavitri', authorize('Nhân viên y tế', 'Admin'), getBagsByPosition);

// All staff can view inventory
router.get('/', authorize('Nhân viên y tế', 'Admin'), getAllTuiMau);
router.get('/:id', authorize('Nhân viên y tế', 'Admin'), getTuiMauById);
router.get('/positions/summary', getPositionSummary);
router.get('/positions/:mavitri', getBagsByPosition);

// Staff can create/update blood bags (collect blood & input data)
// Chỉ Nhân viên y tế được phép thao tác với túi máu
router.post('/', authorize('Nhân viên y tế'), validateBody(CreateTuiMauSchema), createTuiMau);
router.put('/:id', authorize('Nhân viên y tế'), validateBody(UpdateTuiMauSchema), updateTuiMau);
router.patch('/:id/status', authorize('Nhân viên y tế'), validateBody(UpdateTuiMauStatusSchema), updateBagStatus);

export default router;
