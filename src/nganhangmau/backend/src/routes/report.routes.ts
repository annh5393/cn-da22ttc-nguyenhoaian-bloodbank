import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  getMonthlyReport,
  getBloodInventory,
  getComprehensiveInventory,
  getExpiringBlood,
  getExpiredBlood,
  getLowStockAlert,
  getDashboard,
  getDonorActivity,
} from '../controllers/report.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Dashboard stats (all authenticated users can view)
router.get('/dashboard', getDashboard);

// Blood inventory reports (all staff can view)
router.get('/inventory', getBloodInventory);
router.get('/inventory/comprehensive', getComprehensiveInventory);
router.get('/inventory/expiring', getExpiringBlood);
router.get('/inventory/expired', getExpiredBlood);
router.get('/inventory/low-stock', getLowStockAlert);

// Monthly comprehensive report (Admin only)
router.get('/monthly', authorize('Admin'), getMonthlyReport);

// Donor activity report (all staff can view)
router.get('/donors/activity', getDonorActivity);

export default router;
