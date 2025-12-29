import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  createStaffAccount,
  getAllStaff,
  updateStaffAccount,
  deleteStaffAccount,
  setNguoiHienStatus,
  setNhanVienStatus,
  resetNguoiHienPassword,
  resetNhanVienPassword,
  getAllNguoiHienForAdmin,
} from '../controllers/admin.controller';

const router = Router();

// All routes require authentication and Admin role
router.use(authenticate);
router.use(authorize('Admin'));

// Staff management routes
router.post('/staff', createStaffAccount);
router.get('/staff', getAllStaff);
router.put('/staff/:id', updateStaffAccount);
router.delete('/staff/:id', deleteStaffAccount);

// Account management routes (NEW)
router.patch('/nguoihien/:id/status', setNguoiHienStatus);
router.patch('/nhanvien/:id/status', setNhanVienStatus);
router.post('/nguoihien/:id/reset-password', resetNguoiHienPassword);
router.post('/nhanvien/:id/reset-password', resetNhanVienPassword);
router.get('/nguoihien/all', getAllNguoiHienForAdmin);

export default router;
