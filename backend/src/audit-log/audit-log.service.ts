import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationService } from 'src/common/services/pagination.service';
import { SearchAuditLogDto } from './dto';
import { $Enums } from '@prisma/client';
import { UpdateUserDto } from 'src/users/dto';

@Injectable()
export class AuditLogService {
  logLogin(id: string, ipAddress: string | undefined, userAgent: string | undefined) {
    throw new Error('Method not implemented.');
  }
  logLogout(userId: string, ipAddress: string | undefined, userAgent: string | undefined) {
    throw new Error('Method not implemented.');
  }
  logCreate(currentUserId: string, arg1: string, id: string, arg3: { fullName: string; email: string; role: $Enums.UserRole; }) {
    throw new Error('Method not implemented.');
  }
  logUpdate(currentUserId: string, arg1: string, id: string, arg3: { changes: UpdateUserDto; }) {
    throw new Error('Method not implemented.');
  }
  logDelete(currentUserId: string, arg1: string, id: string, arg3: { deletedUser: string; }) {
    throw new Error('Method not implemented.');
  }
  log(arg0: { userId: string; action: string; entity: string; entityId: string; details: { fullName: string; }; }) {
    throw new Error('Method not implemented.');
  }
  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService,
  ) {}

  async findAll(searchDto: SearchAuditLogDto) {
    const {
      page = 1,
      limit = 20,
      userId,
      action,
      entity,
      entityId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = searchDto;

    const where: any = {};

    // Filter by user
    if (userId) {
      where.userId = userId;
    }

    // Filter by action
    if (action) {
      where.action = { contains: action, mode: 'insensitive' };
    }

    // Filter by entity
    if (entity) {
      where.entity = entity;
    }

    // Filter by entity ID
    if (entityId) {
      where.entityId = entityId;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: this.paginationService.getSkip(page, limit),
        take: limit,
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
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return this.paginationService.paginate(logs, total, page, limit);
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
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async findByUser(userId: string) {
    return this.prisma.auditLog.findMany({
      where: { userId },
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
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      total,
      todayCount,
      uniqueUsers,
      entitiesTracked,
      recentActivities,
    ] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
      this.prisma.auditLog.groupBy({
        by: ['userId'],
        _count: true,
      }),
      this.prisma.auditLog.groupBy({
        by: ['entity'],
        _count: true,
      }),
      this.prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      total,
      todayCount,
      uniqueUsersCount: uniqueUsers.length,
      entitiesTrackedCount: entitiesTracked.length,
      recentActivities,
    };
  }
}