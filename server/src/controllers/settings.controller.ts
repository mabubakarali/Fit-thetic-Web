import { Request, Response, NextFunction } from 'express';
import { SettingsService } from '../services/settings.service.js';
import { AuditService } from '../services/audit.service.js';

export class SettingsController {
  static async getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await SettingsService.getSettings();
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await SettingsService.updateSettings(req.body);

      if (req.user) {
        await AuditService.logAction({
          actorId: req.user.userId,
          actorRole: req.user.role,
          actorName: req.user.name,
          action: 'GYM_SETTINGS_UPDATED',
          resource: 'settings',
          metadata: req.body,
          ipAddress: req.ip,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Gym settings updated',
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }
}
