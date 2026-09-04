import mongoose, { Schema, Document } from 'mongoose';

export interface IDaySchedule {
  day: string; // "Monday", "Tuesday", etc.
  isOpen: boolean;
  openTime: string; // "06:00"
  closeTime: string; // "23:00"
}

export interface IGymSettings extends Document {
  gymName: string;
  tagline: string;
  timezone: string;
  cancellationWindowHours: number;
  defaultCapacity: number;
  weeklySchedule: IDaySchedule[];
  contactEmail: string;
  contactPhone: string;
  address: string;
  announcement: {
    message: string;
    active: boolean;
  };
  updatedAt: Date;
}

const GymSettingsSchema = new Schema<IGymSettings>(
  {
    gymName: { type: String, default: 'FORGE' },
    tagline: { type: String, default: 'BUILT TO PERFORM.' },
    timezone: { type: String, default: 'Asia/Karachi' },
    cancellationWindowHours: { type: Number, default: 2, min: 0 },
    defaultCapacity: { type: Number, default: 12, min: 1 },
    weeklySchedule: [
      {
        day: { type: String, required: true },
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: '06:00' },
        closeTime: { type: String, default: '23:00' },
      },
    ],
    contactEmail: { type: String, default: 'concierge@forgegym.com' },
    contactPhone: { type: String, default: '+92 (300) 847-3921' },
    address: { type: String, default: 'Plot 14-C, Performance Boulevard, Phase 6, DHA' },
    announcement: {
      message: { type: String, default: 'New Olympic Lifting Platforms & Infrared Sauna Now Open.' },
      active: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

export const GymSettings = mongoose.model<IGymSettings>('GymSettings', GymSettingsSchema);
