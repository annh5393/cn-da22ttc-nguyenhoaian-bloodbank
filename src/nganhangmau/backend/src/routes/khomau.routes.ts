import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  getAllKhoMau,
  getKhoMauById,
  createKhoMau,
  updateKhoMau,
  deleteKhoMau,
  assignStaffToKho,
  removeStaffFromKho,
} from '../controllers/khomau.controller';
import { validateBody } from '../middleware/validate.middleware';
import { CreateKhoMauSchema, UpdateKhoMauSchema, AssignStaffSchema, RemoveStaffSchema } from '../schemas/khomau.schema';

const router = Router();

router.use(authenticate);

// All staff can view warehouse info
router.get('/', getAllKhoMau);
router.get('/:id', getKhoMauById);

// Staff can manage warehouses
router.post('/', authorize('Admin', 'Nhân viên y tế'), validateBody(CreateKhoMauSchema), createKhoMau);
router.put('/:id', authorize('Admin', 'Nhân viên y tế'), validateBody(UpdateKhoMauSchema), updateKhoMau);
router.delete('/:id', authorize('Admin'), deleteKhoMau);

// Staff assignment
router.post('/assign', authorize('Admin', 'Nhân viên y tế'), validateBody(AssignStaffSchema), assignStaffToKho);
router.delete('/assign', authorize('Admin', 'Nhân viên y tế'), validateBody(RemoveStaffSchema), removeStaffFromKho);

export default router;
