import mongoose, { Schema, Document, Types } from 'mongoose';
import { BOOKING_STATUS, BookingStatus } from '../config/constants.js';

export interface IBooking extends Document {
  bookingReference: string;
  customerId: Types.ObjectId;
  userId: Types.ObjectId;
  slotId: Types.ObjectId;
  status: BookingStatus;
  idempotencyKey?: string;
  bookedAt: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingReference: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    slotId: { type: Schema.Types.ObjectId, ref: 'Slot', required: true, index: true },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.CONFIRMED,
      index: true,
    },
    idempotencyKey: { type: String, sparse: true, index: true },
    bookedAt: { type: Date, default: Date.now },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
  },
  {
    timestamps: true,
  }
);

// Prevent same customer from having more than one active CONFIRMED booking for the same slot
BookingSchema.index(
  { customerId: 1, slotId: 1 },
  { unique: true, partialFilterExpression: { status: 'CONFIRMED' } }
);

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
