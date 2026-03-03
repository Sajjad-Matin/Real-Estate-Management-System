import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AgencyStatus } from '@prisma/client';
import { AuditAction, AuditService } from 'src/common/services/audit.service';
import { CurrentUser } from 'src/common/types';
import { CreateAgencyDto, SearchAgenciesDto, UpdateAgencyDto } from './dto';
import { PaginationService } from 'src/common/services/pagination.service';

@Injectable()
export class AgenciesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private paginationService: PaginationService,
  ) {}
  async createAgency(createAgencyDto: CreateAgencyDto) {
    const existingAgency = await this.prisma.agency.findUnique({
      where: { licenseNumber: createAgencyDto.licenseNumber },
    });
    if (existingAgency) {
      throw new ConflictException('Agency already exists!');
    }

    const newAgency = await this.prisma.agency.create({
      data: {
        name: createAgencyDto.name,
        licenseNumber: createAgencyDto.licenseNumber,
        address: createAgencyDto.address,
        region: createAgencyDto.region,
        status: createAgencyDto.status,
      },
    });
    return newAgency;
  }

  async findAll(searchDto: SearchAgenciesDto) {
    const { page, limit, search, sortBy, sortOrder, status, region } = searchDto;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (region) {
      where.region = {
        contains: region,
        mode: 'insensitive',
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { licenseNumber: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await this.prisma.agency.count({ where });

    // Get paginated data
    const agencies = await this.prisma.agency.findMany({
      where,
      include: {
        _count: {
          select: {
            users: true,
            properties: true,
            tradeTransactions: true,
          },
        },
      },
      orderBy: {
        [sortBy || 'createdAt']: sortOrder || 'desc',
      },
      skip: this.paginationService.getSkip(page || 1, limit || 10),
      take: limit || 10,
    });

    return this.paginationService.paginate(
      agencies,
      total,
      page || 1,
      limit || 10,
    );
  }

  async findOne(id: string) {
    const agency = await this.prisma.agency.findUnique({
      where: { id },
    });
    if (!agency) {
      throw new NotFoundException('Agency not found!');
    }
    return agency;
  }

  async update(id: string, updateAgencyDto: UpdateAgencyDto) {
    const agency = await this.prisma.agency.findUnique({
      where: { id },
    });
    if (!agency) {
      throw new NotFoundException('Agency not found!');
    }
    if (updateAgencyDto.licenseNumber) {
      const existingAgency = await this.prisma.agency.findUnique({
        where: { licenseNumber: updateAgencyDto.licenseNumber },
      });

      if (existingAgency && existingAgency.id !== id) {
        throw new ConflictException(
          'License number already in use by another agency',
        );
      }
    }
    const updatedAgency = await this.prisma.agency.update({
      where: { id },
      data: updateAgencyDto,
    });

    return {
      message: 'Agency updated successfully',
      agency: updatedAgency,
    };
  }

  async remove(id: string) {
    const agency = await this.prisma.agency.findUnique({
      where: { id },
      include: {
        users: true,
        properties: true,
      },
    });

    if (!agency) {
      throw new NotFoundException('Agency not found');
    }

    await this.prisma.agency.delete({
      where: { id },
    });

    return {
      message: 'Agency deleted successfully',
    };
  }

  async updateStatus(
    id: string,
    status: AgencyStatus,
    currentUser: CurrentUser,
  ) {
    const agency = await this.prisma.agency.findUnique({
      where: { id },
    });

    if (!agency) {
      throw new NotFoundException('Agency not found');
    }

    const updatedAgency = await this.prisma.agency.update({
      where: { id },
      data: { status },
    });

    // Determine which action to log
    let action: AuditAction;
    if (status === AgencyStatus.BANNED) action = AuditAction.BAN_AGENCY;
    else if (status === AgencyStatus.CLOSED) action = AuditAction.CLOSE_AGENCY;
    else action = AuditAction.ACTIVATE_AGENCY;

    // Log the action
    await this.auditService.log({
      userId: currentUser.id,
      action,
      entity: 'Agency',
      entityId: id,
      details: {
        oldStatus: agency.status,
        newStatus: status,
      },
    });

    return {
      message: `Agency status updated to ${status}`,
      agency: updatedAgency,
    };
  }
}
