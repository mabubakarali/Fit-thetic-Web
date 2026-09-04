import mongoose from 'mongoose';
import { Employee, IEmployee } from '../models/Employee.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { memoryStore, MemTrainer } from '../store/memoryStore.js';

export interface CreateEmployeeDTO {
  name: string;
  email: string;
  phone: string;
  position: string;
  bio: string;
  specialization: string[];
  workingDays?: string[];
  workingHours?: { start: string; end: string };
  profileImage?: string;
}

export interface UpdateEmployeeDTO {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  bio?: string;
  specialization?: string[];
  workingDays?: string[];
  workingHours?: { start: string; end: string };
  profileImage?: string;
  isActive?: boolean;
}

export class EmployeeService {
  static async getAllEmployees(onlyActive = true): Promise<any[]> {
    if (mongoose.connection.readyState === 1) {
      const query = onlyActive ? { isActive: true } : {};
      return Employee.find(query).sort({ name: 1 });
    }

    let list = [...memoryStore.trainers];
    if (onlyActive) list = list.filter((t) => t.isActive);
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }

  static async getEmployeeById(id: string): Promise<any> {
    if (mongoose.connection.readyState === 1) {
      const employee = await Employee.findById(id);
      if (!employee) throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', 'Trainer not found');
      return employee;
    }

    const trainer = memoryStore.trainers.find((t) => t._id === id);
    if (!trainer) throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', 'Trainer not found');
    return trainer;
  }

  static async createEmployee(dto: CreateEmployeeDTO): Promise<any> {
    const email = dto.email.toLowerCase().trim();
    if (mongoose.connection.readyState === 1) {
      const existing = await Employee.findOne({ email });
      if (existing) throw new ApiError(409, 'EMAIL_EXISTS', 'A trainer with this email already exists');
      return Employee.create({ ...dto, email, isActive: true });
    }

    const existing = memoryStore.trainers.find((t) => t.email === email);
    if (existing) throw new ApiError(409, 'EMAIL_EXISTS', 'A trainer with this email already exists');

    const newTrainer: MemTrainer = {
      _id: `t_${Date.now()}`,
      name: dto.name.trim(),
      email,
      phone: dto.phone.trim(),
      position: dto.position.trim(),
      bio: dto.bio,
      specialization: dto.specialization,
      workingDays: dto.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      workingHours: dto.workingHours || { start: '06:00', end: '14:00' },
      profileImage: dto.profileImage || '/assets/trainer_ahmed.jpg',
      isActive: true,
    };

    memoryStore.trainers.push(newTrainer);
    return newTrainer;
  }

  static async updateEmployee(id: string, dto: UpdateEmployeeDTO): Promise<any> {
    if (mongoose.connection.readyState === 1) {
      const employee = await Employee.findById(id);
      if (!employee) throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', 'Trainer not found');
      Object.assign(employee, dto);
      await employee.save();
      return employee;
    }

    const trainer = memoryStore.trainers.find((t) => t._id === id);
    if (!trainer) throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', 'Trainer not found');
    Object.assign(trainer, dto);
    return trainer;
  }

  static async deleteEmployee(id: string): Promise<void> {
    if (mongoose.connection.readyState === 1) {
      const employee = await Employee.findById(id);
      if (!employee) throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', 'Trainer not found');
      employee.isActive = false;
      await employee.save();
      return;
    }

    const trainer = memoryStore.trainers.find((t) => t._id === id);
    if (!trainer) throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', 'Trainer not found');
    trainer.isActive = false;
  }
}
