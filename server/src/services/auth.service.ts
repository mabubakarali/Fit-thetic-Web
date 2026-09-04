import mongoose from 'mongoose';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User.js';
import { Customer } from '../models/Customer.js';
import { Membership } from '../models/Membership.js';
import { ENV } from '../config/env.js';
import { USER_ROLES, MEMBERSHIP_TIER, MEMBERSHIP_STATUS } from '../config/constants.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { memoryStore, MemUser } from '../store/memoryStore.js';

export interface RegisterDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    customerId?: string;
  };
  token: string;
}

export class AuthService {
  static generateToken(user: { _id?: any; id?: string; email: string; role: string; name: string }, customerId?: string): string {
    const payload = {
      userId: user._id?.toString() || user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      customerId,
    };
    return jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    });
  }

  static async register(dto: RegisterDTO): Promise<AuthResult> {
    const email = dto.email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ email });
      if (existing) {
        throw new ApiError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(dto.password, salt);

      const user = await User.create({
        name: dto.name.trim(),
        email,
        phone: dto.phone.trim(),
        passwordHash,
        role: USER_ROLES.CUSTOMER,
        isActive: true,
      });

      const customer = await Customer.create({
        userId: user._id,
        totalBookings: 0,
      });

      const membership = await Membership.create({
        customerId: customer._id,
        tier: MEMBERSHIP_TIER.PERFORMANCE,
        status: MEMBERSHIP_STATUS.ACTIVE,
        startDate: new Date(),
        maxBookingsPerWeek: 7,
      });

      customer.activeMembershipId = membership._id as any;
      await customer.save();

      const token = this.generateToken(user, customer._id.toString());
      return {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          customerId: customer._id.toString(),
        },
        token,
      };
    }

    // Memory Store Path
    const existing = memoryStore.users.find((u) => u.email === email);
    if (existing) {
      throw new ApiError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const newUserId = `u_${Date.now()}`;
    const newCustId = `c_${Date.now()}`;

    const newUser: MemUser = {
      _id: newUserId,
      name: dto.name.trim(),
      email,
      phone: dto.phone.trim(),
      passwordHash,
      role: 'CUSTOMER',
      isActive: true,
      createdAt: new Date(),
      comparePassword: async function (p) {
        return bcrypt.compare(p, this.passwordHash);
      },
    };

    memoryStore.users.push(newUser);

    const newCustomer = {
      _id: newCustId,
      userId: newUser,
      totalBookings: 0,
      activeMembershipId: { tier: 'PERFORMANCE', status: 'ACTIVE' },
      createdAt: new Date(),
    };

    memoryStore.customers.push(newCustomer);

    const token = this.generateToken(newUser, newCustId);
    return {
      user: {
        id: newUserId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        customerId: newCustId,
      },
      token,
    };
  }

  static async login(dto: LoginDTO): Promise<AuthResult> {
    const email = dto.email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email });
      if (!user) {
        throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
      }
      if (!user.isActive) {
        throw new ApiError(403, 'ACCOUNT_DEACTIVATED', 'This account has been deactivated.');
      }
      const isValid = await user.comparePassword(dto.password);
      if (!isValid) {
        throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
      }

      let customerId: string | undefined;
      if (user.role === USER_ROLES.CUSTOMER) {
        const customer = await Customer.findOne({ userId: user._id });
        if (customer) customerId = customer._id.toString();
      }

      const token = this.generateToken(user, customerId);
      return {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          customerId,
        },
        token,
      };
    }

    // Memory Store Path
    const user = memoryStore.users.find((u) => u.email === email);
    if (!user) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }
    if (!user.isActive) {
      throw new ApiError(403, 'ACCOUNT_DEACTIVATED', 'This account has been deactivated.');
    }

    const isValid = await user.comparePassword(dto.password);
    if (!isValid) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    let customerId: string | undefined;
    if (user.role === 'CUSTOMER') {
      const cust = memoryStore.customers.find((c) => (c.userId as any)._id === user._id || c.userId === user._id);
      if (cust) customerId = cust._id;
    }

    const token = this.generateToken(user, customerId);
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        customerId,
      },
      token,
    };
  }

  static async getMe(userId: string): Promise<any> {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(userId).select('-passwordHash');
      if (!user) {
        throw new ApiError(404, 'USER_NOT_FOUND', 'User profile not found');
      }
      let customerData = null;
      if (user.role === USER_ROLES.CUSTOMER) {
        customerData = await Customer.findOne({ userId: user._id }).populate('activeMembershipId');
      }
      return { user, customer: customerData };
    }

    const user = memoryStore.users.find((u) => u._id === userId);
    if (!user) {
      throw new ApiError(404, 'USER_NOT_FOUND', 'User profile not found');
    }

    let customerData = null;
    if (user.role === 'CUSTOMER') {
      customerData = memoryStore.customers.find((c) => (c.userId as any)._id === user._id || c.userId === user._id);
    }

    return {
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      customer: customerData,
    };
  }
}
