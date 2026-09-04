import { z } from 'zod';

export const createEmployeeSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().min(7),
    position: z.string().min(2),
    bio: z.string().min(10),
    specialization: z.array(z.string()).min(1),
    workingDays: z.array(z.string()).optional(),
    workingHours: z
      .object({
        start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
        end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
      })
      .optional(),
    profileImage: z.string().optional(),
  }),
});

export const updateEmployeeSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(7).optional(),
    position: z.string().min(2).optional(),
    bio: z.string().min(10).optional(),
    specialization: z.array(z.string()).optional(),
    workingDays: z.array(z.string()).optional(),
    workingHours: z
      .object({
        start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
        end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
      })
      .optional(),
    profileImage: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});
