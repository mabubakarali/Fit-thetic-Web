import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICustomer extends Document {
  userId: Types.ObjectId;
  activeMembershipId?: Types.ObjectId;
  totalBookings: number;
  lastBookingAt?: Date;
  emergencyContact?: {
    name: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    activeMembershipId: { type: Schema.Types.ObjectId, ref: 'Membership' },
    totalBookings: { type: Number, default: 0 },
    lastBookingAt: { type: Date },
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
