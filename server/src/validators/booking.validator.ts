import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    slotId: z.string().min(1, 'Slot ID is required'),
    customerId: z.string().optional(), // If admin is booking on behalf of customer
    idempotencyKey: z.string().max(100).optional(),
  }),
});

export const cancelBookingSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Booking ID is required'),
  }),
  body: z.object({
    reason: z.string().max(250).optional(),
  }),
});
