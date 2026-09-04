import { api } from './api';
import { Booking } from '../types';

export const bookingService = {
  async createBooking(data: { slotId: string; customerId?: string; idempotencyKey?: string }): Promise<Booking> {
    const res = await api.post('/bookings', data);
    return res.data.data;
  },

  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    const res = await api.post(`/bookings/${id}/cancel`, { reason });
    return res.data.data;
  },

  async getBookings(params?: {
    date?: string;
    slotId?: string;
    customerId?: string;
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Booking[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const res = await api.get('/bookings', { params });
    return res.data;
  },

  async getBookingById(id: string): Promise<Booking> {
    const res = await api.get(`/bookings/${id}`);
    return res.data.data;
  },
};
