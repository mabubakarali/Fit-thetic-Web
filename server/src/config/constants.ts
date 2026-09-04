export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const SLOT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  FULL: 'FULL',
  LOCKED: 'LOCKED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;

export type SlotStatus = (typeof SLOT_STATUS)[keyof typeof SLOT_STATUS];

export const OPERATIONAL_STATUS = {
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;

export type OperationalStatus = (typeof OPERATIONAL_STATUS)[keyof typeof OPERATIONAL_STATUS];

export const BOOKING_STATUS = {
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  NO_SHOW: 'NO_SHOW',
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const MEMBERSHIP_TIER = {
  DAY_PASS: 'DAY_PASS',
  PERFORMANCE: 'PERFORMANCE',
  BLACK_TIER: 'BLACK_TIER',
} as const;

export type MembershipTier = (typeof MEMBERSHIP_TIER)[keyof typeof MEMBERSHIP_TIER];

export const MEMBERSHIP_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  FROZEN: 'FROZEN',
  EXPIRED: 'EXPIRED',
} as const;

export type MembershipStatus = (typeof MEMBERSHIP_STATUS)[keyof typeof MEMBERSHIP_STATUS];
