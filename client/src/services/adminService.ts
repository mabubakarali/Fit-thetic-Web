import { api } from './api';
import { Trainer, Customer, GymSettings, AdminMetrics, AuditLog } from '../types';

export const trainerService = {
  async getAll(all = false): Promise<Trainer[]> {
    const res = await api.get('/employees', { params: { all } });
    return res.data.data;
  },

  async getById(id: string): Promise<Trainer> {
    const res = await api.get(`/employees/${id}`);
    return res.data.data;
  },

  async create(data: Partial<Trainer>): Promise<Trainer> {
    const res = await api.post('/employees', data);
    return res.data.data;
  },

  async update(id: string, data: Partial<Trainer>): Promise<Trainer> {
    const res = await api.patch(`/employees/${id}`, data);
    return res.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/employees/${id}`);
  },
};

export const customerService = {
  async getAll(params?: { search?: string; page?: number; limit?: number }) {
    const res = await api.get('/customers', { params });
    return res.data;
  },

  async getById(id: string): Promise<Customer> {
    const res = await api.get(`/customers/${id}`);
    return res.data.data;
  },
};

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

export const adminService = {
  async getMetrics(): Promise<AdminMetrics> {
    const res = await api.get('/admin/metrics');
    return res.data.data;
  },

  async getAuditLogs(params?: { page?: number; limit?: number; resource?: string; action?: string }) {
    const res = await api.get('/admin/audit-logs', { params });
    return res.data;
  },
};
