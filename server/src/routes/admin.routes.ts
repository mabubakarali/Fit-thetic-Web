import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/metrics', authenticate, requireAdmin, AdminController.getDashboardMetrics);
router.get('/audit-logs', authenticate, requireAdmin, AdminController.getAuditLogs);

export default router;
