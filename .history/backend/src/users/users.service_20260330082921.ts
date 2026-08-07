import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from './dto';
import * as bcrypt from 'bcrypt';
import { PaginationService } from 'src/common/services/pagination.service';
import { AuditLoggerService } from 'src/common/services/audit-logger.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService,
    private auditLogService: AuditLoggerService,
  ) {}

  async createUser(dto: CreateUserDto, currentUserId?: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email Already Exists!');
    }

    if (dto.role === UserRole.AGENCY_ADMIN && dto.agencyId) {
      const agency = await this.prisma.agency.findUnique({
        where: { id: dto.agencyId },
      });
      if (!agency) {
        throw new NotFoundException('Agency not found');
      }
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        passwordHash: hashedPassword,
        role: dto.role,
        language: dto.language,
        isActive: dto.isActive ?? true,
        agencyId: dto.agencyId,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        language: true,
        isActive: true,
        agencyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (currentUserId) {
      await this.auditLogService.logCreate(currentUserId, 'User', newUser.id, {
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      });
    }

    return {
      message: 'User created successfully',
      user: newUser,
    };
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: this.paginationService.getSkip(page, limit),
        take: limit,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          language: true,
          isActive: true,
          agencyId: true,
          agency: {
            select: {
              id: true,
              name: true,
              licenseNumber: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return this.paginationService.paginate(users, total, page, limit);
  }

  async findByRole(role: UserRole) {
    return this.prisma.user.findMany({
      where: { role },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        language: true,
        isActive: true,
        agencyId: true,
        agency: {
          select: {
            id: true,
            name: true,
            licenseNumber: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByAgency(agencyId: string) {
    return this.prisma.user.findMany({
      where: { agencyId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        language: true,
        isActive: true,
        agencyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        language: true,
        isActive: true,
        agencyId: true,
        agency: {
          select: {
            id: true,
            name: true,
            licenseNumber: true,
            status: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            sessions: true,
            auditLogs: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUserId: string,
  ) {
    await this.validateSuperAdminPromotion(updateUserDto.role, currentUserId);

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      updateUserDto.role === UserRole.AGENCY_ADMIN &&
      updateUserDto.agencyId
    ) {
      const agency = await this.prisma.agency.findUnique({
        where: { id: updateUserDto.agencyId },
      });

      if (!agency) {
        throw new NotFoundException('Agency not found');
      }
    }

    if (
      updateUserDto.role &&
      updateUserDto.role !== UserRole.AGENCY_ADMIN &&
      user.agencyId
    ) {
      updateUserDto.agencyId = null as any;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...(updateUserDto.fullName && { fullName: updateUserDto.fullName }),
        ...(updateUserDto.language && { language: updateUserDto.language }),
        ...(updateUserDto.role && { role: updateUserDto.role }),
        ...(updateUserDto.isActive !== undefined && {
          isActive: updateUserDto.isActive,
        }),
        ...(updateUserDto.agencyId !== undefined && {
          agencyId: updateUserDto.agencyId,
        }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        language: true,
        isActive: true,
        agencyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await this.auditLogService.logUpdate(currentUserId, 'User', id, {
      changes: updateUserDto,
    });

    return {
      message: 'User updated successfully',
      user: updatedUser,
    };
  }

  async remove(id: string, currentUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id === currentUserId) {
      throw new ConflictException('Cannot delete your own account');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    await this.auditLogService.logDelete(currentUserId, 'User', id, {
      deletedUser: user.fullName,
    });

    return { message: 'User deleted successfully' };
  }

  async deactivate(id: string, currentUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    await this.prisma.session.deleteMany({
      where: { userId: id },
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: 'DEACTIVATE_USER',
      entity: 'User',
      entityId: id,
      details: { fullName: updatedUser.fullName },
    });

    return {
      message: 'User deactivated successfully',
      user: updatedUser,
    };
  }

  async activate(id: string, currentUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: 'ACTIVATE_USER',
      entity: 'User',
      entityId: id,
      details: { fullName: updatedUser.fullName },
    });

    return {
      message: 'User activated successfully',
      user: updatedUser,
    };
  }

  private async validateSuperAdminPromotion(
    requestedRole?: UserRole,
    currentUserId?: string,
  ) {
    if (requestedRole === UserRole.SUPER_ADMIN && currentUserId) {
      const callingUser = await this.prisma.user.findUnique({
        where: { id: currentUserId },
        select: { role: true },
      });

      if (callingUser?.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException(
          'Only a Super Admin can grant Super Admin privileges',
        );
      }
    }
  }
}
