import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AgencyStatus } from '@prisma/client';

@Injectable()
export class AgenciesService {
  constructor(private prisma: PrismaService) {}
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

  async findAll() {
    return await this.prisma.agency.findMany();
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

  async updateStatus(id: string, status: AgencyStatus) {
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

    return {
      message: `Agency status updated to ${status}`,
      agency: updatedAgency,
    };
  }
}
