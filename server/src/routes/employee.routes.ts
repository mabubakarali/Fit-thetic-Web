import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller.js';
import { validate } from '../middlewares/validate.js';
import { createEmployeeSchema, updateEmployeeSchema } from '../validators/employee.validator.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';

const router = Router();

// Public: View trainers
router.get('/', EmployeeController.getAll);
router.get('/:id', EmployeeController.getById);

// Admin-only management
router.post('/', authenticate, requireAdmin, validate(createEmployeeSchema), EmployeeController.create);
router.patch('/:id', authenticate, requireAdmin, validate(updateEmployeeSchema), EmployeeController.update);
router.delete('/:id', authenticate, requireAdmin, EmployeeController.delete);

export default router;
