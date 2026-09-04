import mongoose, { Types } from 'mongoose';
import crypto from 'crypto';
import { Booking, IBooking } from '../models/Booking.js';
import { Slot } from '../models/Slot.js';
import { Customer } from '../models/Customer.js';
import { BookingEvent } from '../models/BookingEvent.js';
import { GymSettings } from '../models/GymSettings.js';
import { BOOKING_STATUS, OPERATIONAL_STATUS, USER_ROLES } from '../config/constants.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { memoryStore, MemBooking } from '../store/memoryStore.js';

export interface CreateBookingDTO {
  slotId: string;
  customerId: string;
  userId: string;
  actorRole: string;
  idempotencyKey?: string;
}

export interface CancelBookingDTO {
  bookingId: string;
  actorUserId: string;
  actorRole: string;
  reason?: string;
}

export interface BookingFilterQuery {
  date?: string;
  slotId?: string;
  customerId?: string;
  userId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export class BookingService {
  static generateBookingReference(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const bytes = crypto.randomBytes(6);
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[bytes[i] % chars.length];
    }
    return `FRG-${code}`;
  }

  static isInsideCancellationWindow(slotDate: string, startTime: string, windowHours: number): boolean {
    const [hours, minutes] = startTime.split(':').map(Number);
    const sessionDate = new Date(`${slotDate}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`);
    const now = new Date();
    const diffMs = sessionDate.getTime() - now.getTime();
    return diffMs / (1000 * 60 * 60) < windowHours;
  }

  static async createBooking(dto: CreateBookingDTO): Promise<any> {
    if (mongoose.connection.readyState === 1) {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        if (dto.idempotencyKey) {
          const existingWithKey = await Booking.findOne({ idempotencyKey: dto.idempotencyKey })
            .populate('slotId')
            .populate('customerId')
            .session(session);

          if (existingWithKey) {
            await session.commitTransaction();
            return existingWithKey;
          }
        }

        const customer = await Customer.findById(dto.customerId).session(session);
        if (!customer) throw new ApiError(404, 'CUSTOMER_NOT_FOUND', 'Customer record not found');

        const slot = await Slot.findById(dto.slotId).session(session);
        if (!slot || slot.operationalStatus !== OPERATIONAL_STATUS.ACTIVE) {
          throw new ApiError(400, 'SLOT_UNAVAILABLE', 'This slot is unavailable or has been cancelled');
        }
        if (slot.isLocked) throw new ApiError(400, 'SLOT_LOCKED', 'This slot is locked by gym administration');
        if (slot.currentBookings >= slot.capacity) throw new ApiError(409, 'SLOT_FULL', 'This slot is fully booked');

        const existingActive = await Booking.findOne({
          customerId: customer._id,
          slotId: slot._id,
          status: BOOKING_STATUS.CONFIRMED,
        }).session(session);

        if (existingActive) {
          throw new ApiError(409, 'DUPLICATE_BOOKING', 'You already have an active booking for this training slot');
        }

        slot.currentBookings += 1;
        await slot.save({ session });

        let bookingRef = this.generateBookingReference();
        const [booking] = await Booking.create(
          [
            {
              bookingReference: bookingRef,
              customerId: customer._id,
              userId: new Types.ObjectId(dto.userId),
              slotId: slot._id,
              status: BOOKING_STATUS.CONFIRMED,
              idempotencyKey: dto.idempotencyKey,
              bookedAt: new Date(),
            },
          ],
          { session }
        );

        customer.totalBookings += 1;
        customer.lastBookingAt = new Date();
        await customer.save({ session });

        await session.commitTransaction();

        return Booking.findById(booking._id)
          .populate({
            path: 'slotId',
            populate: { path: 'trainerId', select: 'name position profileImage' },
          })
          .populate({
            path: 'customerId',
            populate: { path: 'userId', select: 'name email phone' },
          });
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }

    // Memory Store Path (Atomic Capacity + Rollback)
    if (dto.idempotencyKey) {
      const existing = memoryStore.bookings.find((b) => b.idempotencyKey === dto.idempotencyKey);
      if (existing) return existing;
    }

    const customer = memoryStore.customers.find((c) => c._id === dto.customerId);
    if (!customer) throw new ApiError(404, 'CUSTOMER_NOT_FOUND', 'Customer record not found');

    const slot = memoryStore.slots.find((s) => s._id === dto.slotId);
    if (!slot || slot.operationalStatus !== 'ACTIVE') {
      throw new ApiError(400, 'SLOT_UNAVAILABLE', 'This slot is unavailable or has been cancelled');
    }
    if (slot.isLocked) throw new ApiError(400, 'SLOT_LOCKED', 'This slot is locked by gym administration');
    if (slot.currentBookings >= slot.capacity) throw new ApiError(409, 'SLOT_FULL', 'This slot is fully booked');

    const existingActive = memoryStore.bookings.find(
      (b) =>
        ((b.customerId as any)._id === customer._id || b.customerId === customer._id) &&
        ((b.slotId as any)._id === slot._id || b.slotId === slot._id) &&
        b.status === 'CONFIRMED'
    );
    if (existingActive) {
      throw new ApiError(409, 'DUPLICATE_BOOKING', 'You already have an active booking for this training slot');
    }

    // Atomically increment
    slot.currentBookings += 1;
    slot.spotsAvailable = Math.max(0, slot.capacity - slot.currentBookings);
    slot.status = memoryStore.deriveSlotStatus(slot);

    const bookingRef = this.generateBookingReference();
    const newBookingId = `b_${Date.now()}`;
    const newBooking: MemBooking = {
      _id: newBookingId,
      bookingReference: bookingRef,
      customerId: customer,
      userId: dto.userId,
      slotId: slot,
      status: 'CONFIRMED',
      idempotencyKey: dto.idempotencyKey,
      bookedAt: new Date(),
    };

    memoryStore.bookings.push(newBooking);
    customer.totalBookings += 1;
    customer.lastBookingAt = new Date();

    return newBooking;
  }

  static async cancelBooking(dto: CancelBookingDTO): Promise<any> {
    if (mongoose.connection.readyState === 1) {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const booking = await Booking.findById(dto.bookingId).populate('slotId').session(session);
        if (!booking || booking.status !== BOOKING_STATUS.CONFIRMED) {
          throw new ApiError(400, 'BOOKING_NOT_ACTIVE', 'Booking is not active or already cancelled');
        }

        if (dto.actorRole === USER_ROLES.CUSTOMER) {
          if (booking.userId.toString() !== dto.actorUserId) {
            throw new ApiError(403, 'FORBIDDEN', 'Cannot cancel another customer booking');
          }
          const slot = booking.slotId as any;
          if (this.isInsideCancellationWindow(slot.date, slot.startTime, 2)) {
            throw new ApiError(400, 'CANCELLATION_WINDOW_CLOSED', 'Cancellations must be made at least 2 hours before session.');
          }
        }

        booking.status = BOOKING_STATUS.CANCELLED;
        booking.cancelledAt = new Date();
        booking.cancellationReason = dto.reason || 'Cancelled';
        await booking.save({ session });

        await Slot.updateOne({ _id: booking.slotId, currentBookings: { $gt: 0 } }, { $inc: { currentBookings: -1 } }).session(session);

        await session.commitTransaction();
        return booking;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }

    // Memory Store Path
    const booking = memoryStore.bookings.find((b) => b._id === dto.bookingId);
    if (!booking || booking.status !== 'CONFIRMED') {
      throw new ApiError(400, 'BOOKING_NOT_ACTIVE', 'Booking is not active or already cancelled');
    }

    if (dto.actorRole === 'CUSTOMER') {
      if (booking.userId !== dto.actorUserId) {
        throw new ApiError(403, 'FORBIDDEN', 'Cannot cancel another customer booking');
      }
      const slot = typeof booking.slotId === 'object' ? (booking.slotId as any) : null;
      if (slot && this.isInsideCancellationWindow(slot.date, slot.startTime, 2)) {
        throw new ApiError(400, 'CANCELLATION_WINDOW_CLOSED', 'Cancellations must be made at least 2 hours before session.');
      }
    }

    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date();
    booking.cancellationReason = dto.reason || 'Cancelled';

    const slot = typeof booking.slotId === 'object' ? (booking.slotId as any) : null;
    if (slot && slot.currentBookings > 0) {
      slot.currentBookings -= 1;
      slot.spotsAvailable = Math.max(0, slot.capacity - slot.currentBookings);
      slot.status = memoryStore.deriveSlotStatus(slot);
    }

    return booking;
  }

  static async getBookings(filter: BookingFilterQuery, user: { userId: string; role: string }): Promise<any> {
    if (mongoose.connection.readyState === 1) {
      const query: any = {};
      if (user.role === USER_ROLES.CUSTOMER) {
        query.userId = new Types.ObjectId(user.userId);
      } else {
        if (filter.customerId) query.customerId = new Types.ObjectId(filter.customerId);
        if (filter.userId) query.userId = new Types.ObjectId(filter.userId);
      }
      if (filter.slotId) query.slotId = new Types.ObjectId(filter.slotId);
      if (filter.status) query.status = filter.status;

      const page = Math.max(1, Number(filter.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(filter.limit) || 20));
      const skip = (page - 1) * limit;

      const [total, data] = await Promise.all([
        Booking.countDocuments(query),
        Booking.find(query)
          .populate({ path: 'slotId', populate: { path: 'trainerId', select: 'name position profileImage' } })
          .populate({ path: 'customerId', populate: { path: 'userId', select: 'name email phone' } })
          .sort({ bookedAt: -1 })
          .skip(skip)
          .limit(limit),
      ]);

      return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    // Memory Store Path
    let list = [...memoryStore.bookings];
    if (user.role === 'CUSTOMER') {
      list = list.filter((b) => b.userId === user.userId);
    } else {
      if (filter.customerId) {
        list = list.filter((b) => ((b.customerId as any)._id || b.customerId) === filter.customerId);
      }
      if (filter.userId) {
        list = list.filter((b) => b.userId === filter.userId);
      }
    }

    if (filter.slotId) {
      list = list.filter((b) => ((b.slotId as any)._id || b.slotId) === filter.slotId);
    }
    if (filter.status) {
      list = list.filter((b) => b.status === filter.status);
    }

    list.sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime());

    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filter.limit) || 20));
    const skip = (page - 1) * limit;

    const paginated = list.slice(skip, skip + limit);
    return {
      data: paginated,
      pagination: {
        total: list.length,
        page,
        limit,
        totalPages: Math.ceil(list.length / limit),
      },
    };
  }

  static async getBookingById(id: string, user: { userId: string; role: string }): Promise<any> {
    if (mongoose.connection.readyState === 1) {
      const booking = await Booking.findById(id)
        .populate({ path: 'slotId', populate: { path: 'trainerId', select: 'name position profileImage' } })
        .populate({ path: 'customerId', populate: { path: 'userId', select: 'name email phone' } });

      if (!booking) throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Booking record not found');
      if (user.role === USER_ROLES.CUSTOMER && booking.userId.toString() !== user.userId) {
        throw new ApiError(403, 'FORBIDDEN', 'Access denied to this booking');
      }
      return booking;
    }

    const booking = memoryStore.bookings.find((b) => b._id === id);
    if (!booking) throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Booking record not found');
    if (user.role === 'CUSTOMER' && booking.userId !== user.userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Access denied to this booking');
    }
    return booking;
  }
}
