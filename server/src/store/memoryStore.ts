import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { USER_ROLES, BOOKING_STATUS, OPERATIONAL_STATUS, MEMBERSHIP_TIER, MEMBERSHIP_STATUS } from '../config/constants.js';

export interface MemUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'CUSTOMER' | 'ADMIN';
  isActive: boolean;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

export interface MemCustomer {
  _id: string;
  userId: string | MemUser;
  activeMembershipId?: any;
  totalBookings: number;
  lastBookingAt?: Date;
  createdAt: Date;
}

export interface MemTrainer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  position: string;
  bio: string;
  specialization: string[];
  workingDays: string[];
  workingHours: { start: string; end: string };
  isActive: boolean;
}

export interface MemSlot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  trainerId: string | MemTrainer;
  capacity: number;
  currentBookings: number;
  isLocked: boolean;
  operationalStatus: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
  status: 'AVAILABLE' | 'FULL' | 'LOCKED' | 'CANCELLED' | 'COMPLETED';
  spotsAvailable: number;
  createdAt: Date;
}

export interface MemBooking {
  _id: string;
  bookingReference: string;
  customerId: string | MemCustomer;
  userId: string;
  slotId: string | MemSlot;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  idempotencyKey?: string;
  bookedAt: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

export interface MemAuditLog {
  _id: string;
  actorId: string;
  actorRole: string;
  actorName: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: any;
  ipAddress?: string;
  timestamp: Date;
}

class MemoryDataStore {
  public users: MemUser[] = [];
  public customers: MemCustomer[] = [];
  public trainers: MemTrainer[] = [];
  public slots: MemSlot[] = [];
  public bookings: MemBooking[] = [];
  public auditLogs: MemAuditLog[] = [];
  public settings: any = null;
  private initialized = false;

  public async initSeed() {
    if (this.initialized) return;
    this.initialized = true;

    this.settings = {
      _id: 'settings_01',
      gymName: 'FORGE',
      tagline: 'BUILT TO PERFORM.',
      timezone: 'Asia/Karachi',
      cancellationWindowHours: 2,
      defaultCapacity: 12,
      weeklySchedule: [
        { day: 'Monday', isOpen: true, openTime: '06:00', closeTime: '23:00' },
        { day: 'Tuesday', isOpen: true, openTime: '06:00', closeTime: '23:00' },
        { day: 'Wednesday', isOpen: true, openTime: '06:00', closeTime: '23:00' },
        { day: 'Thursday', isOpen: true, openTime: '06:00', closeTime: '23:00' },
        { day: 'Friday', isOpen: true, openTime: '06:00', closeTime: '23:00' },
        { day: 'Saturday', isOpen: true, openTime: '07:00', closeTime: '21:00' },
        { day: 'Sunday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
      ],
      contactEmail: 'concierge@forgegym.com',
      contactPhone: '+92 (300) 847-3921',
      address: 'Plot 14-C, Performance Boulevard, Phase 6, DHA',
      announcement: {
        message: 'New Olympic Lifting Platforms & Infrared Sauna Now Open.',
        active: true,
      },
    };

    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('ForgeAdmin2026!', salt);
    const custHash = await bcrypt.hash('Customer123!', salt);

    const admin: MemUser = {
      _id: 'u_admin_01',
      name: 'Tariq Malik',
      email: 'admin@forgegym.com',
      phone: '+92 300 5551234',
      passwordHash: adminHash,
      role: 'ADMIN',
      isActive: true,
      createdAt: new Date(),
      comparePassword: async function (p) {
        return bcrypt.compare(p, this.passwordHash);
      },
    };

    const cust1: MemUser = {
      _id: 'u_cust_01',
      name: 'Zayn Ali',
      email: 'zayn@gmail.com',
      phone: '+92 321 8887766',
      passwordHash: custHash,
      role: 'CUSTOMER',
      isActive: true,
      createdAt: new Date(),
      comparePassword: async function (p) {
        return bcrypt.compare(p, this.passwordHash);
      },
    };

    const cust2: MemUser = {
      _id: 'u_cust_02',
      name: 'Sarah Jenkins',
      email: 'sarah@gmail.com',
      phone: '+92 333 4445566',
      passwordHash: custHash,
      role: 'CUSTOMER',
      isActive: true,
      createdAt: new Date(),
      comparePassword: async function (p) {
        return bcrypt.compare(p, this.passwordHash);
      },
    };

    this.users = [admin, cust1, cust2];

    const customer1: MemCustomer = {
      _id: 'c_01',
      userId: cust1,
      totalBookings: 1,
      lastBookingAt: new Date(),
      activeMembershipId: { tier: 'BLACK_TIER', status: 'ACTIVE' },
      createdAt: new Date(),
    };

    const customer2: MemCustomer = {
      _id: 'c_02',
      userId: cust2,
      totalBookings: 1,
      lastBookingAt: new Date(),
      activeMembershipId: { tier: 'PERFORMANCE', status: 'ACTIVE' },
      createdAt: new Date(),
    };

    this.customers = [customer1, customer2];

    const trainerAhmed: MemTrainer = {
      _id: 't_01',
      name: 'Ahmed Khan',
      email: 'ahmed.coach@forgegym.com',
      phone: '+92 300 1112233',
      profileImage: '/assets/trainer_ahmed.jpg',
      position: 'Head Strength & Conditioning Coach',
      bio: 'Former national Olympic weightlifter with 12+ years optimizing human biomechanics, hypertrophy, and maximum force output.',
      specialization: ['Olympic Weightlifting', 'Barbell Strength', 'Power & Hypertrophy', 'Periodization'],
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      workingHours: { start: '06:00', end: '14:00' },
      isActive: true,
    };

    const trainerElena: MemTrainer = {
      _id: 't_02',
      name: 'Elena Rostova',
      email: 'elena.coach@forgegym.com',
      phone: '+92 300 4445566',
      profileImage: '/assets/trainer_elena.jpg',
      position: 'High-Performance & Athletic Conditioning Specialist',
      bio: 'Ex-triathlon coach and elite endurance specialist dedicated to metabolic conditioning, sprint mechanics, and threshold capacity.',
      specialization: ['HIIT Conditioning', 'Athletic Agility', 'Cardiorespiratory Endurance', 'Functional Movement'],
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sun'],
      workingHours: { start: '07:00', end: '16:00' },
      isActive: true,
    };

    const trainerMarcus: MemTrainer = {
      _id: 't_03',
      name: 'Marcus Vance',
      email: 'marcus.coach@forgegym.com',
      phone: '+92 300 7778899',
      profileImage: '/assets/trainer_marcus.jpg',
      position: 'Powerlifting & Kinetic Mobility Specialist',
      bio: 'Pioneering functional range conditioning, spine biomechanics, power development, and joint longevity for elite athletes.',
      specialization: ['Powerlifting Peak', 'Kinetic Mobility', 'Post-Rehab Longevity', 'Core Stability'],
      workingDays: ['Mon', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      workingHours: { start: '12:00', end: '21:00' },
      isActive: true,
    };

    this.trainers = [trainerAhmed, trainerElena, trainerMarcus];

    // Slots for 14 days
    const slotTimes = [
      { start: '06:00', end: '07:00', trainer: trainerAhmed, cap: 12 },
      { start: '07:00', end: '08:00', trainer: trainerElena, cap: 12 },
      { start: '08:00', end: '09:00', trainer: trainerAhmed, cap: 12 },
      { start: '09:00', end: '10:00', trainer: trainerElena, cap: 10 },
      { start: '10:00', end: '11:00', trainer: trainerMarcus, cap: 12 },
      { start: '12:00', end: '13:00', trainer: trainerMarcus, cap: 10 },
      { start: '16:00', end: '17:00', trainer: trainerElena, cap: 12 },
      { start: '17:00', end: '18:00', trainer: trainerAhmed, cap: 12 },
      { start: '18:00', end: '19:00', trainer: trainerMarcus, cap: 12 },
      { start: '19:00', end: '20:00', trainer: trainerAhmed, cap: 12 },
      { start: '20:00', end: '21:00', trainer: trainerMarcus, cap: 8 },
    ];

    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      for (let j = 0; j < slotTimes.length; j++) {
        const t = slotTimes[j];
        const isLocked = i === 0 && t.start === '09:00';
        const isFull = i === 0 && t.start === '07:00';
        const currentBookings = isFull ? t.cap : i === 0 && t.start === '06:00' ? 8 : i === 0 && t.start === '18:00' ? 10 : Math.floor(Math.random() * 4);

        const slotId = `slot_${dateStr}_${t.start.replace(':', '')}`;
        const slotObj: MemSlot = {
          _id: slotId,
          date: dateStr,
          startTime: t.start,
          endTime: t.end,
          trainerId: t.trainer,
          capacity: t.cap,
          currentBookings,
          isLocked,
          operationalStatus: 'ACTIVE',
          status: isLocked ? 'LOCKED' : currentBookings >= t.cap ? 'FULL' : 'AVAILABLE',
          spotsAvailable: Math.max(0, t.cap - currentBookings),
          createdAt: new Date(),
        };

        this.slots.push(slotObj);

        // Initial bookings for demo
        if (i === 0 && t.start === '06:00') {
          this.bookings.push({
            _id: 'b_01',
            bookingReference: 'FRG-8X29KD',
            customerId: customer1,
            userId: cust1._id,
            slotId: slotObj,
            status: 'CONFIRMED',
            bookedAt: new Date(),
          });
        }
        if (i === 0 && t.start === '18:00') {
          this.bookings.push({
            _id: 'b_02',
            bookingReference: 'FRG-7M49VT',
            customerId: customer2,
            userId: cust2._id,
            slotId: slotObj,
            status: 'CONFIRMED',
            bookedAt: new Date(),
          });
        }
      }
    }

    console.log(`[MemoryStore] Initialized with ${this.users.length} users, ${this.trainers.length} trainers, ${this.slots.length} slots, and ${this.bookings.length} bookings.`);
  }

  public deriveSlotStatus(slot: MemSlot): 'AVAILABLE' | 'FULL' | 'LOCKED' | 'CANCELLED' | 'COMPLETED' {
    if (slot.operationalStatus === 'CANCELLED') return 'CANCELLED';
    if (slot.operationalStatus === 'COMPLETED') return 'COMPLETED';
    if (slot.isLocked) return 'LOCKED';
    if (slot.currentBookings >= slot.capacity) return 'FULL';
    return 'AVAILABLE';
  }
}

export const memoryStore = new MemoryDataStore();
