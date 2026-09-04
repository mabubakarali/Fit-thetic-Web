import { z } from 'zod';

export const createSlotSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be formatted as HH:mm'),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be formatted as HH:mm'),
    trainerId: z.string().min(1, 'Trainer ID is required'),
    capacity: z.number().int().min(1).max(100).optional(),
  }),
});

export const updateSlotSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
    trainerId: z.string().optional(),
    capacity: z.number().int().min(1).max(100).optional(),
    isLocked: z.boolean().optional(),
  }),
});

export const lockSlotSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    isLocked: z.boolean(),
  }),
});

export const bulkSlotsSchema = z.object({
  body: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    slotsPerDay: z.array(
      z.object({
        startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
        endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
        trainerId: z.string().min(1),
        capacity: z.number().int().min(1).optional(),
      })
    ),
  }),
});
