import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
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
      orderBy: {
        createdAt: 'desc',
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

  async update(id: string, updateUserDto: UpdateUserDto) {
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

    return {
      message: 'User deleted successfully',
    };
  }

  async deactivate(id: string) {
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

    // Delete all active sessions
    await this.prisma.session.deleteMany({
      where: { userId: id },
    });

    return {
      message: 'User deactivated successfully',
      user: updatedUser,
    };
  }

  async activate(id: string) {
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

    return {
      message: 'User activated successfully',
      user: updatedUser,
    };
  }

  // Get users by agency
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
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get users by role
  async findByRole(role: UserRole) {
    return this.prisma.user.findMany({
      where: { role },
      select: {
        id: true,
        fullName: true,
        email: true,
        language: true,
        isActive: true,
        agencyId: true,
        agency: {
          select: {
            name: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
