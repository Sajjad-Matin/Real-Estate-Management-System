import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export interface LogEntry {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLoggerService {
  constructor(private prisma: PrismaService) {}

  async log(entry: LogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId,
          details: entry.details || {},
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
        },
      });
    } catch (error) {
      // Don't throw errors - logging should never break the app
      console.error('Failed to create audit log:', error);
    }
  }

  async logLogin(userId: string, ipAddress?: string, userAgent?: string) {
    await this.log({
      userId,
      action: 'LOGIN',
      entity: 'User',
      entityId: userId,
      details: { event: 'User logged in' },
      ipAddress,
      userAgent,
    });
  }

  async logLogout(userId: string, ipAddress?: string, userAgent?: string) {
    await this.log({
      userId,
      action: 'LOGOUT',
      entity: 'User',
      entityId: userId,
      details: { event: 'User logged out' },
      ipAddress,
      userAgent,
    });
  }

  async logCreate(
    userId: string,
    entity: string,
    entityId: string,
    details?: any,
    ipAddress?: string,
  ) {
    await this.log({
      userId,
      action: `CREATE_${entity.toUpperCase()}`,
      entity,
      entityId,
      details,
      ipAddress,
    });
  }

  async logUpdate(
    userId: string,
    entity: string,
    entityId: string,
    details?: any,
    ipAddress?: string,
  ) {
    await this.log({
      userId,
      action: `UPDATE_${entity.toUpperCase()}`,
      entity,
      entityId,
      details,
      ipAddress,
    });
  }

  async logDelete(
    userId: string,
    entity: string,
    entityId: string,
    details?: any,
    ipAddress?: string,
  ) {
    await this.log({
      userId,
      action: `DELETE_${entity.toUpperCase()}`,
      entity,
      entityId,
      details,
      ipAddress,
    });
  }

  async logVerify(
    userId: string,
    entityId: string,
    status: string,
    details?: any,
    ipAddress?: string,
  ) {
    await this.log({
      userId,
      action: `VERIFY_TRANSACTION_${status}`,
      entity: 'Transaction',
      entityId,
      details,
      ipAddress,
    });
  }
}