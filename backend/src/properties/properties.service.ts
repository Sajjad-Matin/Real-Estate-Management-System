import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { CreatePropertyDto, UpdatePropertyDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async create(createPropertyDto: CreatePropertyDto, currentUser: any) {
    // If AGENCY_ADMIN, use their agency (override whatever they send)
    if (currentUser.role === UserRole.AGENCY_ADMIN) {
      if (!currentUser.agencyId) {
        throw new ForbiddenException('You are not associated with any agency');
      }
      createPropertyDto.agencyId = currentUser.agencyId;
    }

    // If SUPER_ADMIN, verify agency exists
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      const agency = await this.prisma.agency.findUnique({
        where: { id: createPropertyDto.agencyId },
      });

      if (!agency) {
        throw new NotFoundException('Agency not found');
      }
    }

    // Check if cadastral number already exists
    if (createPropertyDto.cadastralNo) {
      const existingProperty = await this.prisma.property.findUnique({
        where: { cadastralNo: createPropertyDto.cadastralNo },
      });

      if (existingProperty) {
        throw new ConflictException(
          'Property with this cadastral number already exists',
        );
      }
    }

    // Create property
    const property = await this.prisma.property.create({
      data: createPropertyDto,
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            licenseNumber: true,
          },
        },
      },
    });

    return {
      message: 'Property registered successfully',
      property,
    };
  }

  async findAll(currentUser: any) {
    // If AGENCY_ADMIN, only show their agency's properties
    const where =
      currentUser.role === UserRole.AGENCY_ADMIN
        ? { agencyId: currentUser.agencyId }
        : {}; // SUPER_ADMIN and INSPECTOR see all

    return this.prisma.property.findMany({
      where,
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            licenseNumber: true,
          },
        },
        _count: {
          select: {
            ownerships: true,
            trades: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, currentUser: any) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            licenseNumber: true,
            status: true,
          },
        },
        ownerships: {
          orderBy: {
            fromDate: 'desc',
          },
        },
        trades: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            verifications: true,
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // If AGENCY_ADMIN, verify they own this property
    if (
      currentUser.role === UserRole.AGENCY_ADMIN &&
      property.agencyId !== currentUser.agencyId
    ) {
      throw new ForbiddenException(
        'You do not have permission to view this property',
      );
    }

    return property;
  }

  async update(
    id: string,
    updatePropertyDto: UpdatePropertyDto,
    currentUser: any,
  ) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // If AGENCY_ADMIN, verify they own this property
    if (
      currentUser.role === UserRole.AGENCY_ADMIN &&
      property.agencyId !== currentUser.agencyId
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this property',
      );
    }

    // Check cadastral number uniqueness if being updated
    if (updatePropertyDto.cadastralNo) {
      const existingProperty = await this.prisma.property.findFirst({
        where: {
          cadastralNo: updatePropertyDto.cadastralNo,
          NOT: { id },
        },
      });

      if (existingProperty) {
        throw new ConflictException('Cadastral number already in use');
      }
    }

    const updatedProperty = await this.prisma.property.update({
      where: { id },
      data: updatePropertyDto,
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            licenseNumber: true,
          },
        },
      },
    });

    return {
      message: 'Property updated successfully',
      property: updatedProperty,
    };
  }

  async remove(id: string, currentUser: any) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        trades: true,
        ownerships: true,
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Only SUPER_ADMIN can delete properties
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Only SUPER_ADMIN can delete properties',
      );
    }

    // Prevent deletion if property has trades
    if (property.trades.length > 0) {
      throw new ConflictException(
        'Cannot delete property with existing trade transactions',
      );
    }

    await this.prisma.property.delete({
      where: { id },
    });

    return {
      message: 'Property deleted successfully',
    };
  }

  // Get properties by agency
  async findByAgency(agencyId: string) {
    return this.prisma.property.findMany({
      where: { agencyId },
      include: {
        _count: {
          select: {
            ownerships: true,
            trades: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get properties by region
  async findByRegion(region: string) {
    return this.prisma.property.findMany({
      where: { region },
      include: {
        agency: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            ownerships: true,
            trades: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}