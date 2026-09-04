import mongoose, { Types } from 'mongoose';
import { AuditLog, IAuditLog } from '../models/AuditLog.js';
import { memoryStore, MemAuditLog } from '../store/memoryStore.js';

export interface CreateAuditLogDTO {
  actorId?: string;
  actorRole: string;
  actorName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: any;
  ipAddress?: string;
}

export class AuditService {
  static async logAction(dto: CreateAuditLogDTO): Promise<void> {
    try {
      if (mongoose.connection.readyState === 1) {
        await AuditLog.create({
          actorId: dto.actorId ? new Types.ObjectId(dto.actorId) : undefined,
          actorRole: dto.actorRole,
          actorName: dto.actorName,
          action: dto.action,
          resource: dto.resource,
          resourceId: dto.resourceId,
          metadata: dto.metadata,
          ipAddress: dto.ipAddress,
        });
        return;
      }

      const newLog: MemAuditLog = {
        _id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        actorId: dto.actorId || 'system',
        actorRole: dto.actorRole,
        actorName: dto.actorName || 'System Admin',
        action: dto.action,
        resource: dto.resource,
        resourceId: dto.resourceId,
        metadata: dto.metadata,
        ipAddress: dto.ipAddress,
        timestamp: new Date(),
      };
      memoryStore.auditLogs.unshift(newLog);
    } catch (err) {
      console.error('[AuditService Error]', err);
    }
  }

  static async getLogs(query: { page?: number; limit?: number; action?: string; resource?: string }): Promise<any> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    if (mongoose.connection.readyState === 1) {
      const filter: any = {};
      if (query.action) filter.action = query.action;
      if (query.resource) filter.resource = query.resource;

      const [total, data] = await Promise.all([
        AuditLog.countDocuments(filter),
        AuditLog.find(filter)
          .populate('actorId', 'name email role')
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit),
      ]);

      return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    let list = [...memoryStore.auditLogs];
    if (query.action) list = list.filter((l) => l.action === query.action);
    if (query.resource) list = list.filter((l) => l.resource === query.resource);

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
}
