import { Request, Response, NextFunction } from 'express';
import { SlotService } from '../services/slot.service.js';
import { AuditService } from '../services/audit.service.js';

export class SlotController {
  static async getSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slots = await SlotService.getSlots({
        date: req.query.date as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        trainerId: req.query.trainerId as string,
        includeCancelled: req.query.includeCancelled === 'true',
      });

      res.status(200).json({
        success: true,
        data: slots,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSlotById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slotId = req.params.id as string;
      const slot = await SlotService.getSlotById(slotId);
      res.status(200).json({
        success: true,
        data: slot,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slot = await SlotService.createSlot(req.body);

      // Audit log
      if (req.user) {
        await AuditService.logAction({
          actorId: req.user.userId,
          actorRole: req.user.role,
          actorName: req.user.name,
          action: 'SLOT_CREATED',
          resource: 'slot',
          resourceId: slot._id.toString(),
          metadata: { date: slot.date, time: `${slot.startTime}-${slot.endTime}`, capacity: slot.capacity },
          ipAddress: req.ip,
        });
      }

      res.status(201).json({
        success: true,
        message: 'Slot created successfully',
        data: slot,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slotId = req.params.id as string;
      const slot = await SlotService.updateSlot(slotId, req.body);

      if (req.user) {
        await AuditService.logAction({
          actorId: req.user.userId,
          actorRole: req.user.role,
          actorName: req.user.name,
          action: 'SLOT_UPDATED',
          resource: 'slot',
          resourceId: slot._id.toString(),
          metadata: req.body,
          ipAddress: req.ip,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Slot updated successfully',
        data: slot,
      });
    } catch (error) {
      next(error);
    }
  }

  static async lockSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slotId = req.params.id as string;
      const { isLocked } = req.body;
      const slot = await SlotService.lockSlot(slotId, isLocked);

      if (req.user) {
        await AuditService.logAction({
          actorId: req.user.userId,
          actorRole: req.user.role,
          actorName: req.user.name,
          action: isLocked ? 'SLOT_LOCKED' : 'SLOT_UNLOCKED',
          resource: 'slot',
          resourceId: slot._id.toString(),
          metadata: { isLocked },
          ipAddress: req.ip,
        });
      }

      res.status(200).json({
        success: true,
        message: isLocked ? 'Slot locked' : 'Slot unlocked',
        data: slot,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slotId = req.params.id as string;
      const result = await SlotService.deleteSlot(slotId);

      if (req.user) {
        await AuditService.logAction({
          actorId: req.user.userId,
          actorRole: req.user.role,
          actorName: req.user.name,
          action: result.status === 'CANCELLED' ? 'SLOT_CANCELLED_BY_ADMIN' : 'SLOT_DELETED',
          resource: 'slot',
          resourceId: slotId,
          metadata: result,
          ipAddress: req.ip,
        });
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async bulkGenerate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await SlotService.bulkGenerateSlots(req.body);

      if (req.user) {
        await AuditService.logAction({
          actorId: req.user.userId,
          actorRole: req.user.role,
          actorName: req.user.name,
          action: 'SLOTS_BULK_GENERATED',
          resource: 'slot',
          metadata: { count: result.createdCount, conflictsCount: result.conflicts.length },
          ipAddress: req.ip,
        });
      }

      res.status(201).json({
        success: true,
        message: `Generated ${result.createdCount} slots successfully`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
