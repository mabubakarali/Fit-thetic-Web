import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  position: string;
  bio: string;
  specialization: string[];
  workingDays: string[];
  workingHours: {
    start: string;
    end: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    profileImage: { type: String, default: '/assets/trainer_ahmed.jpg' },
    position: { type: String, required: true, trim: true },
    bio: { type: String, required: true },
    specialization: [{ type: String, trim: true }],
    workingDays: [{ type: String, default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }],
    workingHours: {
      start: { type: String, default: '06:00' },
      end: { type: String, default: '14:00' },
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

export const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);
