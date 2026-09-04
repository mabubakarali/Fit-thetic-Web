import mongoose from 'mongoose';
import { GymSettings, IGymSettings } from '../models/GymSettings.js';
import { memoryStore } from '../store/memoryStore.js';

export class SettingsService {
  static async getSettings(): Promise<any> {
    if (mongoose.connection.readyState === 1) {
      let settings = await GymSettings.findOne();
      if (!settings) {
        settings = await GymSettings.create({
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
      }
      return settings;
    }

    if (!memoryStore.settings) await memoryStore.initSeed();
    return memoryStore.settings;
  }

  static async updateSettings(dto: Partial<IGymSettings>): Promise<any> {
    if (mongoose.connection.readyState === 1) {
      let settings = await GymSettings.findOne();
      if (!settings) settings = await this.getSettings();
      if (settings) {
        Object.assign(settings, dto);
        await settings.save();
      }
      return settings;
    }

    if (!memoryStore.settings) await memoryStore.initSeed();
    Object.assign(memoryStore.settings, dto);
    return memoryStore.settings;
  }
}
