import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { Slot } from '../models/Slot.js';
import { Employee } from '../models/Employee.js';
import { SlotService } from '../services/slot.service.js';

let replSet: MongoMemoryReplSet;

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  });
  await mongoose.connect(replSet.getUri());
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  await replSet.stop();
});

describe('Slot Business Rules & Overlap Prevention', () => {
  it('should reject overlapping time slots for the same trainer', async () => {
    const trainer = await Employee.create({
      name: 'Elena Rostova',
      email: 'elena.overlap@forgegym.com',
      phone: '+92 300 1111111',
      position: 'Coach',
      bio: 'Bio',
      specialization: ['HIIT'],
      workingDays: ['Mon'],
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const dateStr = tomorrow.toISOString().split('T')[0];

    // Create 06:00 to 07:00
    await SlotService.createSlot({
      date: dateStr,
      startTime: '06:00',
      endTime: '07:00',
      trainerId: trainer._id.toString(),
      capacity: 12,
    });

    // Attempt overlapping 06:30 to 07:30 -> must throw TRAINER_SCHEDULE_CONFLICT
    await expect(
      SlotService.createSlot({
        date: dateStr,
        startTime: '06:30',
        endTime: '07:30',
        trainerId: trainer._id.toString(),
        capacity: 12,
      })
    ).rejects.toMatchObject({
      code: 'TRAINER_SCHEDULE_CONFLICT',
    });

    // Non-overlapping 07:00 to 08:00 should succeed
    const slot2 = await SlotService.createSlot({
      date: dateStr,
      startTime: '07:00',
      endTime: '08:00',
      trainerId: trainer._id.toString(),
      capacity: 12,
    });
    expect(slot2).toBeDefined();
    expect(slot2.startTime).toBe('07:00');
  });

  it('should prevent reducing capacity below current booking count', async () => {
    const trainer = await Employee.create({
      name: 'Marcus Vance',
      email: 'marcus.cap@forgegym.com',
      phone: '+92 300 2222222',
      position: 'Coach',
      bio: 'Bio',
      specialization: ['Mobility'],
      workingDays: ['Mon'],
    });

    const slot = await Slot.create({
      date: '2026-09-01',
      startTime: '08:00',
      endTime: '09:00',
      trainerId: trainer._id,
      capacity: 12,
      currentBookings: 8,
    });

    // Attempt reducing capacity to 6 (which is less than currentBookings 8)
    await expect(
      SlotService.updateSlot(slot._id.toString(), {
        capacity: 6,
      })
    ).rejects.toMatchObject({
      code: 'CAPACITY_BELOW_CURRENT_BOOKINGS',
    });

    // Increasing or keeping >= 8 should succeed
    const updated = await SlotService.updateSlot(slot._id.toString(), {
      capacity: 10,
    });
    expect(updated.capacity).toBe(10);
  });
});
