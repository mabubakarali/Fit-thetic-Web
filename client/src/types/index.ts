export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  customerId?: string;
  createdAt: string;
}

export interface Trainer {
  _id: string;
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
}

export type SlotStatus = 'AVAILABLE' | 'FULL' | 'LOCKED' | 'CANCELLED' | 'COMPLETED';

export interface Slot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  trainerId: Trainer | string;
  capacity: number;
  currentBookings: number;
  isLocked: boolean;
  operationalStatus: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
  status: SlotStatus;
  spotsAvailable: number;
  createdAt: string;
}

export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export interface Booking {
  _id: string;
  bookingReference: string;
  customerId: {
    _id: string;
    userId: {
      _id: string;
      name: string;
      email: string;
      phone: string;
    };
  } | string;
  userId: string;
  slotId: Slot;
  status: BookingStatus;
  bookedAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface Customer {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    isActive: boolean;
    createdAt: string;
  };
  activeMembershipId?: {
    _id: string;
    tier: 'DAY_PASS' | 'PERFORMANCE' | 'BLACK_TIER';
    status: string;
    startDate: string;
  };
  totalBookings: number;
  lastBookingAt?: string;
  createdAt: string;
}

export interface GymSettings {
  gymName: string;
  tagline: string;
  timezone: string;
  cancellationWindowHours: number;
  defaultCapacity: number;
  weeklySchedule: Array<{
    day: string;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  }>;
  contactEmail: string;
  contactPhone: string;
  address: string;
  announcement: {
    message: string;
    active: boolean;
  };
}

export interface AdminMetrics {
  todayDate: string;
  metrics: {
    todayBookings: number;
    availableSlots: number;
    fullSlots: number;
    lockedSlots: number;
    activeMembers: number;
  };
  recentBookings: Booking[];
}

export interface AuditLog {
  _id: string;
  actorId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  actorRole: string;
  actorName: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}
