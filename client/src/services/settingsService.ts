import { api } from './api';
import { GymSettings } from '../types';

export const settingsService = {
  async getSettings(): Promise<GymSettings> {
    const res = await api.get('/settings');
    return res.data.data;
  },

  async updateSettings(data: Partial<GymSettings>): Promise<GymSettings> {
    const res = await api.patch('/settings', data);
    return res.data.data;
  },
};
