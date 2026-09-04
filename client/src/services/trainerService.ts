import { api } from './api';
import { Trainer } from '../types';

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
