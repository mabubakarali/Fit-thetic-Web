import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { Slot } from '../models/Slot.js';
import { Customer } from '../models/Customer.js';
import { User } from '../models/User.js';
import { Employee } from '../models/Employee.js';
import { BookingService } from '../services/booking.service.js';
import { USER_ROLES } from '../config/constants.js';

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

describe('Transactional Concurrency & Overbooking Prevention', () => {
  it('should allow exactly 1 booking when 10 concurrent requests target a slot with 1 spot remaining', async () => {
    // 1. Create Trainer
    const trainer = await Employee.create({
      name: 'Ahmed Khan',
      email: 'ahmed.concurrency@forgegym.com',
      phone: '+92 300 0000000',
      position: 'Coach',
      bio: 'Bio',
      specialization: ['Strength'],
      workingDays: ['Mon'],
    });

    // 2. Create Slot with capacity 10, but already 9 bookings -> exactly 1 spot left
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const slot = await Slot.create({
      date: dateStr,
      startTime: '10:00',
      endTime: '11:00',
      trainerId: trainer._id,
      capacity: 10,
      currentBookings: 9,
      isLocked: false,
    });

    // 3. Create 10 distinct customers
    const customerIds: { customerId: string; userId: string }[] = [];
    for (let i = 0; i < 10; i++) {
      const user = await User.create({
        name: `Customer ${i}`,
        email: `concurrency_user_${i}_${Date.now()}@gmail.com`,
        phone: `+92 300 000000${i}`,
        passwordHash: 'hashed',
        role: USER_ROLES.CUSTOMER,
      });

      const customer = await Customer.create({
        userId: user._id,
        totalBookings: 0,
      });

      customerIds.push({
        customerId: customer._id.toString(),
        userId: user._id.toString(),
      });
    }

    // 4. Fire 10 simultaneous booking requests concurrently
    const bookingPromises = customerIds.map((cust) =>
      BookingService.createBooking({
        slotId: slot._id.toString(),
        customerId: cust.customerId,
        userId: cust.userId,
        actorRole: USER_ROLES.CUSTOMER,
      })
        .then((res) => ({ status: 'SUCCESS' as const, data: res }))
        .catch((err: any) => ({ status: 'FAILED' as const, code: err.code as string, message: err.message as string }))
    );

    const results = await Promise.all(bookingPromises);

    const successes = results.filter((r) => r.status === 'SUCCESS');
    const failures = results.filter((r): r is { status: 'FAILED'; code: string; message: string } => r.status === 'FAILED');

    // Exactly 1 must succeed
    expect(successes.length).toBe(1);
    // Exactly 9 must fail with SLOT_FULL
    expect(failures.length).toBe(9);
    for (const fail of failures) {
      expect(fail.code).toBe('SLOT_FULL');
    }

    // Database slot currentBookings must equal capacity 10 (never 19 or 11)
    const updatedSlot = await Slot.findById(slot._id);
    expect(updatedSlot?.currentBookings).toBe(10);
    expect(updatedSlot?.spotsAvailable).toBe(0);
    expect(updatedSlot?.status).toBe('FULL');
  });
});
