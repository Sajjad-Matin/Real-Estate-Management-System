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
  Query,
} from '@nestjs/common';
import { AgenciesService } from './agencies.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { AgencyStatus, UserRole } from '@prisma/client';
import { CurrentUser, Roles } from 'src/common/decorators';
import type { CurrentUser as CurrentUserType } from 'src/common/types';
import { CreateAgencyDto, SearchAgenciesDto, UpdateAgencyDto } from './dto';

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
  async findAll(@Query() searchDto: SearchAgenciesDto) {
    return this.agenciesService.findAll(searchDto);
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
  async ban(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return this.agenciesService.updateStatus(
      id,
      AgencyStatus.BANNED,
      currentUser,
    );
  }

  @Patch(':id/close')
  async close(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return this.agenciesService.updateStatus(
      id,
      AgencyStatus.CLOSED,
      currentUser,
    );
  }

  @Patch(':id/activate')
  async activate(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return this.agenciesService.updateStatus(
      id,
      AgencyStatus.ACTIVE,
      currentUser,
    );
  }
}
