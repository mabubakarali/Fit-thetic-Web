import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { UserRole, USER_ROLES } from '../config/constants.js';
import { User } from '../models/User.js';
import { Customer } from '../models/Customer.js';
import { memoryStore } from '../store/memoryStore.js';
import { ApiError } from './errorHandler.js';

export interface AuthUserPayload {
  userId: string;
  role: UserRole;
  email: string;
  name: string;
  customerId?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication token required');
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, ENV.JWT_SECRET);
    } catch {
      throw new ApiError(401, 'INVALID_TOKEN', 'Session expired or token invalid');
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new ApiError(401, 'USER_INACTIVE_OR_NOT_FOUND', 'User account is deactivated or not found');
      }

      let customerId: string | undefined = decoded.customerId;
      if (!customerId && user.role === USER_ROLES.CUSTOMER) {
        const customer = await Customer.findOne({ userId: user._id });
        if (customer) customerId = customer._id.toString();
      }

      req.user = {
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
        name: user.name,
        customerId,
      };
      return next();
    }

    // Memory Store path
    const user = memoryStore.users.find((u) => u._id === decoded.userId);
    if (!user || !user.isActive) {
      throw new ApiError(401, 'USER_INACTIVE_OR_NOT_FOUND', 'User account is deactivated or not found');
    }

    let customerId: string | undefined = decoded.customerId;
    if (!customerId && user.role === 'CUSTOMER') {
      const cust = memoryStore.customers.find((c) => (c.userId as any)._id === user._id || c.userId === user._id);
      if (cust) customerId = cust._id;
    }

    req.user = {
      userId: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
      customerId,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError(401, 'UNAUTHORIZED', 'Authentication required'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'FORBIDDEN', 'Insufficient permissions for this operation'));
    }
    next();
  };
}

export const requireAdmin = requireRole([USER_ROLES.ADMIN]);
export const requireCustomer = requireRole([USER_ROLES.CUSTOMER, USER_ROLES.ADMIN]);
