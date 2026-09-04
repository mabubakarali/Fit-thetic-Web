import { Router } from 'express';
import mongoose from 'mongoose';
import authRoutes from './auth.routes.js';
import slotRoutes from './slot.routes.js';
import bookingRoutes from './booking.routes.js';
import employeeRoutes from './employee.routes.js';
import customerRoutes from './customer.routes.js';
import settingsRoutes from './settings.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

// Health Check Endpoint with DB status
router.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isDbReady = dbState === 1;

  res.status(200).json({
    status: 'ok',
    service: 'forge-gym-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: isDbReady ? 'connected' : 'in-memory',
  });
});

// API v1 Mounts
router.use('/auth', authRoutes);
router.use('/slots', slotRoutes);
router.use('/bookings', bookingRoutes);
router.use('/employees', employeeRoutes);
router.use('/customers', customerRoutes);
router.use('/settings', settingsRoutes);
router.use('/admin', adminRoutes);

export default router;
