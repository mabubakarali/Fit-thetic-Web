import { Router } from 'express';
import { SlotController } from '../controllers/slot.controller.js';
import { validate } from '../middlewares/validate.js';
import { createSlotSchema, updateSlotSchema, lockSlotSchema, bulkSlotsSchema } from '../validators/slot.validator.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';

const router = Router();

// Public: Get all slots (optionally filtered by date, trainer)
router.get('/', SlotController.getSlots);
router.get('/:id', SlotController.getSlotById);

// Admin-only Slot Management
router.post('/', authenticate, requireAdmin, validate(createSlotSchema), SlotController.createSlot);
router.post('/bulk', authenticate, requireAdmin, validate(bulkSlotsSchema), SlotController.bulkGenerate);
router.patch('/:id', authenticate, requireAdmin, validate(updateSlotSchema), SlotController.updateSlot);
router.post('/:id/lock', authenticate, requireAdmin, validate(lockSlotSchema), SlotController.lockSlot);
router.delete('/:id', authenticate, requireAdmin, SlotController.deleteSlot);

export default router;
