import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UserRole } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators';

@Controller('properties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN)
  async create(
    @Body() createPropertyDto: CreatePropertyDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.propertiesService.create(createPropertyDto, currentUser);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.INSPECTOR)
  async findAll(
    @CurrentUser() currentUser: any,
    @Query('agencyId') agencyId?: string,
    @Query('region') region?: string,
  ) {
    if (agencyId) {
      return this.propertiesService.findByAgency(agencyId);
    }
    if (region) {
      return this.propertiesService.findByRegion(region);
    }
    return this.propertiesService.findAll(currentUser);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.INSPECTOR)
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.propertiesService.findOne(id, currentUser);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.propertiesService.update(id, updatePropertyDto, currentUser);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  async remove(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.propertiesService.remove(id, currentUser);
  }
}
