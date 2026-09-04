import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from '../services/employee.service.js';
import { AuditService } from '../services/audit.service.js';

export class EmployeeController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const onlyActive = req.query.all !== 'true';
      const employees = await EmployeeService.getAllEmployees(onlyActive);
      res.status(200).json({
        success: true,
        data: employees,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.params.id as string;
      const employee = await EmployeeService.getEmployeeById(employeeId);
      res.status(200).json({
        success: true,
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = await EmployeeService.createEmployee(req.body);

      if (req.user) {
        await AuditService.logAction({
          actorId: req.user.userId,
          actorRole: req.user.role,
          actorName: req.user.name,
          action: 'TRAINER_CREATED',
          resource: 'employee',
          resourceId: employee._id.toString(),
          metadata: { name: employee.name, position: employee.position },
          ipAddress: req.ip,
        });
      }

      res.status(201).json({
        success: true,
        message: 'Trainer profile created',
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.params.id as string;
      const employee = await EmployeeService.updateEmployee(employeeId, req.body);

      if (req.user) {
        await AuditService.logAction({
          actorId: req.user.userId,
          actorRole: req.user.role,
          actorName: req.user.name,
          action: 'TRAINER_UPDATED',
          resource: 'employee',
          resourceId: employee._id.toString(),
          metadata: req.body,
          ipAddress: req.ip,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Trainer profile updated',
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.params.id as string;
      await EmployeeService.deleteEmployee(employeeId);

      if (req.user) {
        await AuditService.logAction({
          actorId: req.user.userId,
          actorRole: req.user.role,
          actorName: req.user.name,
          action: 'TRAINER_DEACTIVATED',
          resource: 'employee',
          resourceId: employeeId,
          ipAddress: req.ip,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Trainer deactivated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
