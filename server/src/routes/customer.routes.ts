import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticate, requireAdmin, CustomerController.getAll);
router.get('/:id', authenticate, requireAdmin, CustomerController.getById);

export default router;
