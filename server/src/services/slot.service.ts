import mongoose, { Types } from 'mongoose';
import { Slot, ISlot } from '../models/Slot.js';
import { Employee } from '../models/Employee.js';
import { OPERATIONAL_STATUS } from '../config/constants.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { memoryStore, MemSlot } from '../store/memoryStore.js';

export interface CreateSlotDTO {
  date: string;
  startTime: string;
  endTime: string;
  trainerId: string;
  capacity?: number;
}

export interface UpdateSlotDTO {
  date?: string;
  startTime?: string;
  endTime?: string;
  trainerId?: string;
  capacity?: number;
  isLocked?: boolean;
}

export interface SlotFilterQuery {
  date?: string;
  startDate?: string;
  endDate?: string;
  trainerId?: string;
  includeCancelled?: boolean;
}

export class SlotService {
  static async validateTrainerOverlap(
    date: string,
    startTime: string,
    endTime: string,
    trainerId: string,
    excludeSlotId?: string
  ): Promise<void> {
    if (mongoose.connection.readyState === 1) {
      const query: any = {
        date,
        trainerId: new Types.ObjectId(trainerId),
        operationalStatus: OPERATIONAL_STATUS.ACTIVE,
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      };

      if (excludeSlotId) {
        query._id = { $ne: new Types.ObjectId(excludeSlotId) };
      }

      const conflictingSlot = await Slot.findOne(query).populate('trainerId', 'name');
      if (conflictingSlot) {
        const trainerName = (conflictingSlot.trainerId as any)?.name || 'Trainer';
        throw new ApiError(
          409,
          'TRAINER_SCHEDULE_CONFLICT',
          `Schedule conflict: ${trainerName} already has an active session from ${conflictingSlot.startTime} to ${conflictingSlot.endTime} on ${date}`
        );
      }
      return;
    }

    // Memory Store path
    const conflicting = memoryStore.slots.find((s) => {
      const sTrainerId = typeof s.trainerId === 'object' ? (s.trainerId as any)._id : s.trainerId;
      if (s.date !== date || sTrainerId !== trainerId || s.operationalStatus !== 'ACTIVE') return false;
      if (excludeSlotId && s._id === excludeSlotId) return false;
      return s.startTime < endTime && s.endTime > startTime;
    });

    if (conflicting) {
      const trainerObj = memoryStore.trainers.find((t) => t._id === trainerId);
      throw new ApiError(
        409,
        'TRAINER_SCHEDULE_CONFLICT',
        `Schedule conflict: ${trainerObj?.name || 'Coach'} already has an active session from ${conflicting.startTime} to ${conflicting.endTime} on ${date}`
      );
    }
  }

  static async getSlots(filter: SlotFilterQuery): Promise<any[]> {
    if (mongoose.connection.readyState === 1) {
      const query: any = {};
      if (filter.date) query.date = filter.date;
      else if (filter.startDate && filter.endDate) {
        query.date = { $gte: filter.startDate, $lte: filter.endDate };
      }
      if (filter.trainerId) query.trainerId = new Types.ObjectId(filter.trainerId);
      if (!filter.includeCancelled) query.operationalStatus = { $ne: OPERATIONAL_STATUS.CANCELLED };

      return Slot.find(query)
        .populate('trainerId', 'name position profileImage specialization')
        .sort({ date: 1, startTime: 1 });
    }

    // Memory Store Path
    let list = [...memoryStore.slots];
    if (filter.date) {
      list = list.filter((s) => s.date === filter.date);
    } else if (filter.startDate && filter.endDate) {
      list = list.filter((s) => s.date >= filter.startDate! && s.date <= filter.endDate!);
    }

    if (filter.trainerId) {
      list = list.filter((s) => {
        const tId = typeof s.trainerId === 'object' ? (s.trainerId as any)._id : s.trainerId;
        return tId === filter.trainerId;
      });
    }

    if (!filter.includeCancelled) {
      list = list.filter((s) => s.operationalStatus !== 'CANCELLED');
    }

    return list.sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  }

  static async getSlotById(id: string): Promise<any> {
    if (mongoose.connection.readyState === 1) {
      const slot = await Slot.findById(id).populate('trainerId', 'name position profileImage specialization');
      if (!slot) throw new ApiError(404, 'SLOT_NOT_FOUND', 'Slot not found');
      return slot;
    }

    const slot = memoryStore.slots.find((s) => s._id === id);
    if (!slot) throw new ApiError(404, 'SLOT_NOT_FOUND', 'Slot not found');
    return slot;
  }

  static async createSlot(dto: CreateSlotDTO): Promise<any> {
    if (dto.startTime >= dto.endTime) {
      throw new ApiError(400, 'INVALID_TIME_RANGE', 'Start time must be before end time');
    }

    await this.validateTrainerOverlap(dto.date, dto.startTime, dto.endTime, dto.trainerId);

    if (mongoose.connection.readyState === 1) {
      const trainer = await Employee.findById(dto.trainerId);
      if (!trainer || !trainer.isActive) {
        throw new ApiError(400, 'TRAINER_NOT_FOUND_OR_INACTIVE', 'Assigned trainer not found or is inactive');
      }

      const slot = await Slot.create({
        date: dto.date,
        startTime: dto.startTime,
        endTime: dto.endTime,
        trainerId: new Types.ObjectId(dto.trainerId),
        capacity: dto.capacity || 12,
        currentBookings: 0,
        isLocked: false,
        operationalStatus: OPERATIONAL_STATUS.ACTIVE,
      });

      return slot.populate('trainerId', 'name position profileImage specialization');
    }

    // Memory Store path
    const trainer = memoryStore.trainers.find((t) => t._id === dto.trainerId);
    if (!trainer || !trainer.isActive) {
      throw new ApiError(400, 'TRAINER_NOT_FOUND_OR_INACTIVE', 'Assigned trainer not found or is inactive');
    }

    const newSlotId = `slot_${Date.now()}`;
    const cap = dto.capacity || 12;
    const newSlot: MemSlot = {
      _id: newSlotId,
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      trainerId: trainer,
      capacity: cap,
      currentBookings: 0,
      isLocked: false,
      operationalStatus: 'ACTIVE',
      status: 'AVAILABLE',
      spotsAvailable: cap,
      createdAt: new Date(),
    };

    memoryStore.slots.push(newSlot);
    return newSlot;
  }

  static async updateSlot(id: string, dto: UpdateSlotDTO): Promise<any> {
    if (mongoose.connection.readyState === 1) {
      const slot = await Slot.findById(id);
      if (!slot) throw new ApiError(404, 'SLOT_NOT_FOUND', 'Slot not found');

      if (dto.capacity !== undefined) {
        if (dto.capacity < slot.currentBookings) {
          throw new ApiError(
            400,
            'CAPACITY_BELOW_CURRENT_BOOKINGS',
            `Cannot reduce capacity to ${dto.capacity} because ${slot.currentBookings} customers have booked.`
          );
        }
        slot.capacity = dto.capacity;
      }

      const newDate = dto.date || slot.date;
      const newStart = dto.startTime || slot.startTime;
      const newEnd = dto.endTime || slot.endTime;
      const newTrainerId = dto.trainerId ? new Types.ObjectId(dto.trainerId) : slot.trainerId;

      if (newStart >= newEnd) {
        throw new ApiError(400, 'INVALID_TIME_RANGE', 'Start time must be before end time');
      }

      if (dto.isLocked !== undefined) slot.isLocked = dto.isLocked;

      await slot.save();
      return slot.populate('trainerId', 'name position profileImage specialization');
    }

    // Memory Store path
    const slot = memoryStore.slots.find((s) => s._id === id);
    if (!slot) throw new ApiError(404, 'SLOT_NOT_FOUND', 'Slot not found');

    if (dto.capacity !== undefined) {
      if (dto.capacity < slot.currentBookings) {
        throw new ApiError(
          400,
          'CAPACITY_BELOW_CURRENT_BOOKINGS',
          `Cannot reduce capacity to ${dto.capacity} because ${slot.currentBookings} customers have booked.`
        );
      }
      slot.capacity = dto.capacity;
    }

    if (dto.startTime) slot.startTime = dto.startTime;
    if (dto.endTime) slot.endTime = dto.endTime;
    if (dto.date) slot.date = dto.date;
    if (dto.trainerId) {
      const trainer = memoryStore.trainers.find((t) => t._id === dto.trainerId);
      if (trainer) slot.trainerId = trainer;
    }
    if (dto.isLocked !== undefined) slot.isLocked = dto.isLocked;

    slot.status = memoryStore.deriveSlotStatus(slot);
    slot.spotsAvailable = Math.max(0, slot.capacity - slot.currentBookings);
    return slot;
  }

  static async lockSlot(id: string, isLocked: boolean): Promise<any> {
    if (mongoose.connection.readyState === 1) {
      const slot = await Slot.findById(id);
      if (!slot) throw new ApiError(404, 'SLOT_NOT_FOUND', 'Slot not found');
      slot.isLocked = isLocked;
      await slot.save();
      return slot.populate('trainerId', 'name position profileImage specialization');
    }

    const slot = memoryStore.slots.find((s) => s._id === id);
    if (!slot) throw new ApiError(404, 'SLOT_NOT_FOUND', 'Slot not found');
    slot.isLocked = isLocked;
    slot.status = memoryStore.deriveSlotStatus(slot);
    return slot;
  }

  static async deleteSlot(id: string): Promise<{ deleted: boolean; status: string; message: string }> {
    if (mongoose.connection.readyState === 1) {
      const slot = await Slot.findById(id);
      if (!slot) throw new ApiError(404, 'SLOT_NOT_FOUND', 'Slot not found');

      if (slot.currentBookings > 0) {
        slot.operationalStatus = OPERATIONAL_STATUS.CANCELLED;
        await slot.save();
        return {
          deleted: false,
          status: 'CANCELLED',
          message: `Slot has ${slot.currentBookings} bookings and was marked CANCELLED to preserve history.`,
        };
      }

      await Slot.findByIdAndDelete(id);
      return { deleted: true, status: 'DELETED', message: 'Slot deleted successfully.' };
    }

    const slotIndex = memoryStore.slots.findIndex((s) => s._id === id);
    if (slotIndex === -1) throw new ApiError(404, 'SLOT_NOT_FOUND', 'Slot not found');

    const slot = memoryStore.slots[slotIndex];
    if (slot.currentBookings > 0) {
      slot.operationalStatus = 'CANCELLED';
      slot.status = 'CANCELLED';
      return {
        deleted: false,
        status: 'CANCELLED',
        message: `Slot has ${slot.currentBookings} bookings and was marked CANCELLED to preserve history.`,
      };
    }

    memoryStore.slots.splice(slotIndex, 1);
    return { deleted: true, status: 'DELETED', message: 'Slot deleted successfully.' };
  }

  static async bulkGenerateSlots(dto: any) {
    let createdCount = 0;
    const conflicts: string[] = [];
    return { createdCount, conflicts };
  }
}
