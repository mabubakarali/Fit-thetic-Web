import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';

const router = Router();

// Public: Get general gym settings
router.get('/', SettingsController.getSettings);

// Admin: Update gym settings
router.patch('/', authenticate, requireAdmin, SettingsController.updateSettings);

export default router;
