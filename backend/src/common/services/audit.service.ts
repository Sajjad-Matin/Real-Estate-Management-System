import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export enum AuditAction {
  // Auth
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  REGISTER_USER = 'REGISTER_USER',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET = 'PASSWORD_RESET',

  // Agencies
  CREATE_AGENCY = 'CREATE_AGENCY',
  UPDATE_AGENCY = 'UPDATE_AGENCY',
  DELETE_AGENCY = 'DELETE_AGENCY',
  BAN_AGENCY = 'BAN_AGENCY',
  CLOSE_AGENCY = 'CLOSE_AGENCY',
  ACTIVATE_AGENCY = 'ACTIVATE_AGENCY',

  // Users
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  DEACTIVATE_USER = 'DEACTIVATE_USER',
  ACTIVATE_USER = 'ACTIVATE_USER',

  // Properties
  CREATE_PROPERTY = 'CREATE_PROPERTY',
  UPDATE_PROPERTY = 'UPDATE_PROPERTY',
  DELETE_PROPERTY = 'DELETE_PROPERTY',

  // Transactions
  CREATE_TRANSACTION = 'CREATE_TRANSACTION',
  UPDATE_TRANSACTION = 'UPDATE_TRANSACTION',
  DELETE_TRANSACTION = 'DELETE_TRANSACTION',
  VERIFY_TRANSACTION = 'VERIFY_TRANSACTION',
  APPROVE_TRANSACTION = 'APPROVE_TRANSACTION',
  REJECT_TRANSACTION = 'REJECT_TRANSACTION',
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    userId: string;
    action: AuditAction;
    entity: string;
    entityId: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          details: data.details || {},
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      // Don't fail the main operation if audit logging fails
      console.error('Audit logging failed:', error);
    }
  }

  async findAll(filters?: {
    userId?: string;
    action?: AuditAction;
    entity?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters?.userId) where.userId = filters.userId;
    if (filters?.action) where.action = filters.action;
    if (filters?.entity) where.entity = filters.entity;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    return this.prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Limit to last 100 entries
    });
  }

  async findByEntity(entity: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: {
        entity,
        entityId,
      },
      include: {
        user: {
          select: {
            fullName: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByUser(userId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }
}