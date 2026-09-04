import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Customer } from '../models/Customer.js';
import { Membership } from '../models/Membership.js';
import { Employee } from '../models/Employee.js';
import { Slot } from '../models/Slot.js';
import { Booking } from '../models/Booking.js';
import { GymSettings } from '../models/GymSettings.js';
import { USER_ROLES, MEMBERSHIP_TIER, MEMBERSHIP_STATUS, BOOKING_STATUS, OPERATIONAL_STATUS } from '../config/constants.js';

export async function seedDatabase(): Promise<void> {
  console.log('🌱 [Seed] Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Customer.deleteMany({}),
    Membership.deleteMany({}),
    Employee.deleteMany({}),
    Slot.deleteMany({}),
    Booking.deleteMany({}),
    GymSettings.deleteMany({}),
  ]);

  console.log('🌱 [Seed] Creating Gym Settings...');
  await GymSettings.create({
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
  });

  console.log('🌱 [Seed] Creating Admin and Customer Users...');
  const salt = await bcrypt.genSalt(12);
  const adminPasswordHash = await bcrypt.hash('ForgeAdmin2026!', salt);
  const customerPasswordHash = await bcrypt.hash('Customer123!', salt);

  const admin = await User.create({
    name: 'Tariq Malik',
    email: 'admin@forgegym.com',
    phone: '+92 300 5551234',
    passwordHash: adminPasswordHash,
    role: USER_ROLES.ADMIN,
    isActive: true,
  });

  const customer1 = await User.create({
    name: 'Zayn Ali',
    email: 'zayn@gmail.com',
    phone: '+92 321 8887766',
    passwordHash: customerPasswordHash,
    role: USER_ROLES.CUSTOMER,
    isActive: true,
  });

  const customer2 = await User.create({
    name: 'Sarah Jenkins',
    email: 'sarah@gmail.com',
    phone: '+92 333 4445566',
    passwordHash: customerPasswordHash,
    role: USER_ROLES.CUSTOMER,
    isActive: true,
  });

  // Create Customer Profiles
  const custProfile1 = await Customer.create({
    userId: customer1._id,
    totalBookings: 0,
  });

  const custProfile2 = await Customer.create({
    userId: customer2._id,
    totalBookings: 0,
  });

  // Create Memberships
  const mem1 = await Membership.create({
    customerId: custProfile1._id,
    tier: MEMBERSHIP_TIER.BLACK_TIER,
    status: MEMBERSHIP_STATUS.ACTIVE,
    startDate: new Date(),
    maxBookingsPerWeek: 14,
  });
  custProfile1.activeMembershipId = mem1._id as any;
  await custProfile1.save();

  const mem2 = await Membership.create({
    customerId: custProfile2._id,
    tier: MEMBERSHIP_TIER.PERFORMANCE,
    status: MEMBERSHIP_STATUS.ACTIVE,
    startDate: new Date(),
    maxBookingsPerWeek: 7,
  });
  custProfile2.activeMembershipId = mem2._id as any;
  await custProfile2.save();

  console.log('🌱 [Seed] Creating Elite Trainers...');
  const trainerAhmed = await Employee.create({
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
  });

  const trainerElena = await Employee.create({
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
  });

  const trainerMarcus = await Employee.create({
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
  });

  console.log('🌱 [Seed] Creating Scheduled Slots across next 14 days...');
  const today = new Date();
  const trainers = [trainerAhmed, trainerElena, trainerMarcus];

  const slotTimes = [
    { start: '06:00', end: '07:00', trainerIdx: 0, cap: 12 },
    { start: '07:00', end: '08:00', trainerIdx: 1, cap: 12 },
    { start: '08:00', end: '09:00', trainerIdx: 0, cap: 12 },
    { start: '09:00', end: '10:00', trainerIdx: 1, cap: 10 },
    { start: '10:00', end: '11:00', trainerIdx: 2, cap: 12 },
    { start: '12:00', end: '13:00', trainerIdx: 2, cap: 10 },
    { start: '16:00', end: '17:00', trainerIdx: 1, cap: 12 },
    { start: '17:00', end: '18:00', trainerIdx: 0, cap: 12 },
    { start: '18:00', end: '19:00', trainerIdx: 2, cap: 12 },
    { start: '19:00', end: '20:00', trainerIdx: 0, cap: 12 },
    { start: '20:00', end: '21:00', trainerIdx: 2, cap: 8 },
  ];

  let sampleSlots: any[] = [];

  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];

    for (const t of slotTimes) {
      // Pick trainer
      const trainer = trainers[t.trainerIdx];
      const isLocked = i === 0 && t.start === '09:00'; // 1 locked slot today for demo
      const isFull = i === 0 && t.start === '07:00'; // 1 full slot today
      const currentBookings = isFull ? t.cap : i === 0 && t.start === '06:00' ? 8 : i === 0 && t.start === '18:00' ? 10 : Math.floor(Math.random() * 5);

      const slot = await Slot.create({
        date: dateStr,
        startTime: t.start,
        endTime: t.end,
        trainerId: trainer._id,
        capacity: t.cap,
        currentBookings,
        isLocked,
        operationalStatus: OPERATIONAL_STATUS.ACTIVE,
      });

      if (i === 0) {
        sampleSlots.push(slot);
      }
    }
  }

  // Create initial demo bookings for Customer 1 and 2
  if (sampleSlots.length > 0) {
    const slotA = sampleSlots.find((s) => s.startTime === '06:00');
    if (slotA) {
      await Booking.create({
        bookingReference: 'FRG-8X29KD',
        customerId: custProfile1._id,
        userId: customer1._id,
        slotId: slotA._id,
        status: BOOKING_STATUS.CONFIRMED,
        bookedAt: new Date(),
      });
      custProfile1.totalBookings += 1;
      custProfile1.lastBookingAt = new Date();
      await custProfile1.save();
    }

    const slotB = sampleSlots.find((s) => s.startTime === '18:00');
    if (slotB) {
      await Booking.create({
        bookingReference: 'FRG-7M49VT',
        customerId: custProfile2._id,
        userId: customer2._id,
        slotId: slotB._id,
        status: BOOKING_STATUS.CONFIRMED,
        bookedAt: new Date(),
      });
      custProfile2.totalBookings += 1;
      custProfile2.lastBookingAt = new Date();
      await custProfile2.save();
    }
  }

  console.log('✅ [Seed] Database successfully seeded with:');
  console.log('   - Admin: admin@forgegym.com / ForgeAdmin2026!');
  console.log('   - Customer: zayn@gmail.com / Customer123!');
  console.log('   - Customer: sarah@gmail.com / Customer123!');
  console.log('   - 3 Elite Trainers (Ahmed, Elena, Marcus)');
  console.log('   - 150+ slots generated for the next 14 days');
}

// Standalone execution support
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    await connectDB();
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  })();
}
