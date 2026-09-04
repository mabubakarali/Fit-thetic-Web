import mongoose, { Schema, Document, Types } from 'mongoose';
import { OPERATIONAL_STATUS, OperationalStatus, SLOT_STATUS, SlotStatus } from '../config/constants.js';

export interface ISlot extends Document {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  trainerId: Types.ObjectId;
  capacity: number;
  currentBookings: number;
  isLocked: boolean;
  operationalStatus: OperationalStatus;
  createdAt: Date;
  updatedAt: Date;
  status: SlotStatus; // computed
  spotsAvailable: number; // computed
}

const SlotSchema = new Schema<ISlot>(
  {
    date: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    trainerId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    capacity: { type: Number, required: true, default: 12, min: 1 },
    currentBookings: { type: Number, required: true, default: 0, min: 0 },
    isLocked: { type: Boolean, default: false, index: true },
    operationalStatus: {
      type: String,
      enum: Object.values(OPERATIONAL_STATUS),
      default: OPERATIONAL_STATUS.ACTIVE,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to help lookup slots by date and trainer
SlotSchema.index({ date: 1, startTime: 1, trainerId: 1 });
SlotSchema.index({ date: 1, operationalStatus: 1 });

SlotSchema.virtual('status').get(function (this: ISlot): SlotStatus {
  if (this.operationalStatus === OPERATIONAL_STATUS.CANCELLED) {
    return SLOT_STATUS.CANCELLED;
  }
  if (this.operationalStatus === OPERATIONAL_STATUS.COMPLETED) {
    return SLOT_STATUS.COMPLETED;
  }
  if (this.isLocked) {
    return SLOT_STATUS.LOCKED;
  }
  if (this.currentBookings >= this.capacity) {
    return SLOT_STATUS.FULL;
  }
  return SLOT_STATUS.AVAILABLE;
});

SlotSchema.virtual('spotsAvailable').get(function (this: ISlot): number {
  return Math.max(0, this.capacity - this.currentBookings);
});

export const Slot = mongoose.model<ISlot>('Slot', SlotSchema);
