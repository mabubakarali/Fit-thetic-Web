import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.service.js';
import { Customer } from '../models/Customer.js';
import { USER_ROLES } from '../config/constants.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { AuditService } from '../services/audit.service.js';

export class BookingController {
  static async createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      let customerId = user.customerId;

      // If admin is booking on behalf of another customer
      if (user.role === USER_ROLES.ADMIN && req.body.customerId) {
        customerId = req.body.customerId;
      }

      if (!customerId) {
        const customer = await Customer.findOne({ userId: user.userId });
        if (!customer) {
          throw new ApiError(400, 'CUSTOMER_RECORD_MISSING', 'Customer profile required to make a booking');
        }
        customerId = customer._id.toString();
      }

      const idempotencyKey = (req.headers['idempotency-key'] as string) || req.body.idempotencyKey;

      const booking = await BookingService.createBooking({
        slotId: req.body.slotId,
        customerId,
        userId: user.userId,
        actorRole: user.role,
        idempotencyKey,
      });

      if (user.role === USER_ROLES.ADMIN) {
        await AuditService.logAction({
          actorId: user.userId,
          actorRole: user.role,
          actorName: user.name,
          action: 'ADMIN_MANUAL_BOOKING',
          resource: 'booking',
          resourceId: booking._id.toString(),
          metadata: { bookingReference: booking.bookingReference, customerId },
          ipAddress: req.ip,
        });
      }

      res.status(201).json({
        success: true,
        message: 'Training slot booked successfully',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const bookingId = req.params.id as string;
      const booking = await BookingService.cancelBooking({
        bookingId,
        actorUserId: user.userId,
        actorRole: user.role,
        reason: req.body.reason,
      });

      if (user.role === USER_ROLES.ADMIN) {
        await AuditService.logAction({
          actorId: user.userId,
          actorRole: user.role,
          actorName: user.name,
          action: 'ADMIN_CANCELLED_BOOKING',
          resource: 'booking',
          resourceId: booking._id.toString(),
          metadata: { bookingReference: booking.bookingReference, reason: req.body.reason },
          ipAddress: req.ip,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully and slot reopened',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await BookingService.getBookings(
        {
          date: req.query.date as string,
          slotId: req.query.slotId as string,
          customerId: req.query.customerId as string,
          userId: req.query.userId as string,
          status: req.query.status as string,
          page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
          limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        },
        req.user!
      );

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBookingById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookingId = req.params.id as string;
      const booking = await BookingService.getBookingById(bookingId, req.user!);
      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }
}
