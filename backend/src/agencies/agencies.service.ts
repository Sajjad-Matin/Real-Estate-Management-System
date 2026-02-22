import { ConflictException, Injectable } from '@nestjs/common';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AgenciesService {
  constructor (private prisma: PrismaService){}
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

  findAll() {
    return `This action returns all agencies`;
  }

  findOne(id: number) {
    return `This action returns a #${id} agency`;
  }

  update(id: number, updateAgencyDto: UpdateAgencyDto) {
    return `This action updates a #${id} agency`;
  }

  remove(id: number) {
    return `This action removes a #${id} agency`;
  }
}
