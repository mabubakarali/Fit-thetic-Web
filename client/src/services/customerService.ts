import { api } from './api';
import { Customer } from '../types';

export const customerService = {
  async getAll(params?: { search?: string; page?: number; limit?: number }): Promise<{ data: Customer[]; pagination: any }> {
    const res = await api.get('/customers', { params });
    return res.data;
  },

  async getById(id: string): Promise<Customer> {
    const res = await api.get(`/customers/${id}`);
    return res.data.data;
  },
};
