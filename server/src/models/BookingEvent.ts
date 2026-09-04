import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBookingEvent extends Document {
  bookingId: Types.ObjectId;
  eventType: 'BOOKING_CREATED' | 'BOOKING_CANCELLED' | 'BOOKING_COMPLETED' | 'BOOKING_NO_SHOW';
  actorId: Types.ObjectId;
  actorRole: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

const BookingEventSchema = new Schema<IBookingEvent>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    eventType: {
      type: String,
      enum: ['BOOKING_CREATED', 'BOOKING_CANCELLED', 'BOOKING_COMPLETED', 'BOOKING_NO_SHOW'],
      required: true,
      index: true,
    },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorRole: { type: String, required: true },
    reason: { type: String },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
  }
);

export const BookingEvent = mongoose.model<IBookingEvent>('BookingEvent', BookingEventSchema);
