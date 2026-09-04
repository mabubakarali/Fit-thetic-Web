import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller.js';
import { validate } from '../middlewares/validate.js';
import { createBookingSchema, cancelBookingSchema } from '../validators/booking.validator.js';
import { authenticate } from '../middlewares/auth.js';
import { bookingLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/', authenticate, bookingLimiter, validate(createBookingSchema), BookingController.createBooking);
router.get('/', authenticate, BookingController.getBookings);
router.get('/:id', authenticate, BookingController.getBookingById);
router.post('/:id/cancel', authenticate, validate(cancelBookingSchema), BookingController.cancelBooking);

export default router;
