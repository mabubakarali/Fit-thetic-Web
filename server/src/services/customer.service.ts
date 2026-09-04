import mongoose from 'mongoose';
import { Customer, ICustomer } from '../models/Customer.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { memoryStore } from '../store/memoryStore.js';

export class CustomerService {
  static async getCustomers(query: { search?: string; page?: number; limit?: number }): Promise<any> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    if (mongoose.connection.readyState === 1) {
      const customers = await Customer.find()
        .populate('userId', 'name email phone isActive createdAt')
        .populate('activeMembershipId')
        .sort({ lastBookingAt: -1, createdAt: -1 });

      let filtered = customers;
      if (query.search) {
        const s = query.search.toLowerCase();
        filtered = customers.filter((c: any) => {
          const user = c.userId;
          return (
            user?.name?.toLowerCase().includes(s) ||
            user?.email?.toLowerCase().includes(s) ||
            user?.phone?.includes(s)
          );
        });
      }

      return {
        data: filtered.slice(skip, skip + limit),
        pagination: {
          total: filtered.length,
          page,
          limit,
          totalPages: Math.ceil(filtered.length / limit),
        },
      };
    }

    // Memory Store Path
    let list = [...memoryStore.customers];
    if (query.search) {
      const s = query.search.toLowerCase();
      list = list.filter((c) => {
        const u = c.userId as any;
        return (
          u?.name?.toLowerCase().includes(s) ||
          u?.email?.toLowerCase().includes(s) ||
          u?.phone?.includes(s)
        );
      });
    }

    return {
      data: list.slice(skip, skip + limit),
      pagination: {
        total: list.length,
        page,
        limit,
        totalPages: Math.ceil(list.length / limit),
      },
    };
  }

  static async getCustomerById(id: string): Promise<any> {
    if (mongoose.connection.readyState === 1) {
      const customer = await Customer.findById(id)
        .populate('userId', 'name email phone isActive createdAt')
        .populate('activeMembershipId');

      if (!customer) throw new ApiError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');
      return customer;
    }

    const customer = memoryStore.customers.find((c) => c._id === id);
    if (!customer) throw new ApiError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');
    return customer;
  }
}
