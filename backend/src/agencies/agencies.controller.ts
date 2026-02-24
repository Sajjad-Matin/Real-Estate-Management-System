import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AgenciesService } from './agencies.service';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { AgencyStatus, UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('agencies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AgenciesController {
  constructor(private readonly agenciesService: AgenciesService) {}

  @Post()
  create(@Body() createAgencyDto: CreateAgencyDto) {
    return this.agenciesService.createAgency(createAgencyDto);
  }

  @Get()
  findAll() {
    return this.agenciesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agenciesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAgencyDto: UpdateAgencyDto) {
    return this.agenciesService.update(id, updateAgencyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agenciesService.remove(id);
  }

  @Patch(':id/ban')
  async ban(@Param('id') id: string) {
    return this.agenciesService.updateStatus(id, AgencyStatus.BANNED);
  }

  @Patch(':id/close')
  async close(@Param('id') id: string) {
    return this.agenciesService.updateStatus(id, AgencyStatus.CLOSED);
  }

  @Patch(':id/activate')
  async activate(@Param('id') id: string) {
    return this.agenciesService.updateStatus(id, AgencyStatus.ACTIVE);
  }
}
