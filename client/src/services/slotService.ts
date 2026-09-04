import { api } from './api';
import { Slot } from '../types';

export const slotService = {
  async getSlots(params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    trainerId?: string;
    includeCancelled?: boolean;
  }): Promise<Slot[]> {
    const res = await api.get('/slots', { params });
    return res.data.data;
  },

  async getSlotById(id: string): Promise<Slot> {
    const res = await api.get(`/slots/${id}`);
    return res.data.data;
  },

  async createSlot(data: {
    date: string;
    startTime: string;
    endTime: string;
    trainerId: string;
    capacity?: number;
  }): Promise<Slot> {
    const res = await api.post('/slots', data);
    return res.data.data;
  },

  async updateSlot(
    id: string,
    data: {
      date?: string;
      startTime?: string;
      endTime?: string;
      trainerId?: string;
      capacity?: number;
      isLocked?: boolean;
    }
  ): Promise<Slot> {
    const res = await api.patch(`/slots/${id}`, data);
    return res.data.data;
  },

  async lockSlot(id: string, isLocked: boolean): Promise<Slot> {
    const res = await api.post(`/slots/${id}/lock`, { isLocked });
    return res.data.data;
  },

  async deleteSlot(id: string): Promise<{ deleted: boolean; status: string; message: string }> {
    const res = await api.delete(`/slots/${id}`);
    return res.data.data;
  },

  async bulkGenerate(data: {
    startDate: string;
    endDate: string;
    slotsPerDay: Array<{ startTime: string; endTime: string; trainerId: string; capacity?: number }>;
  }) {
    const res = await api.post('/slots/bulk', data);
    return res.data.data;
  },
};
