import mongoose, { Schema, Document, Types } from 'mongoose';
import { MEMBERSHIP_TIER, MEMBERSHIP_STATUS, MembershipTier, MembershipStatus } from '../config/constants.js';

export interface IMembership extends Document {
  customerId: Types.ObjectId;
  tier: MembershipTier;
  status: MembershipStatus;
  startDate: Date;
  endDate?: Date;
  maxBookingsPerWeek: number;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema<IMembership>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    tier: {
      type: String,
      enum: Object.values(MEMBERSHIP_TIER),
      default: MEMBERSHIP_TIER.PERFORMANCE,
    },
    status: {
      type: String,
      enum: Object.values(MEMBERSHIP_STATUS),
      default: MEMBERSHIP_STATUS.ACTIVE,
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    maxBookingsPerWeek: { type: Number, default: 7 },
  },
  {
    timestamps: true,
  }
);

export const Membership = mongoose.model<IMembership>('Membership', MembershipSchema);
