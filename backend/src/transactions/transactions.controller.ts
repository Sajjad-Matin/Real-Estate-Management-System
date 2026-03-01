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
import { TransactionsService } from './transactions.service';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  VerifyTransactionDto,
} from './dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole, VerificationStatus } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CurrentUser } from 'src/common/decorators';
import type { CurrentUser as CurrentUserType } from 'src/common/types';

@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN)
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return this.transactionsService.create(createTransactionDto, currentUser);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.INSPECTOR)
  async findAll(
    @CurrentUser() currentUser: CurrentUserType,
    @Query('status') status?: VerificationStatus,
    @Query('propertyId') propertyId?: string,
  ) {
    if (propertyId) {
      return this.transactionsService.findByProperty(propertyId);
    }
    return this.transactionsService.findAll(currentUser, status);
  }

  @Get('pending')
  @Roles(UserRole.SUPER_ADMIN, UserRole.INSPECTOR)
  async findPending() {
    return this.transactionsService.findPending();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.INSPECTOR)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return this.transactionsService.findOne(id, currentUser);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return this.transactionsService.update(
      id,
      updateTransactionDto,
      currentUser,
    );
  }

  @Post(':id/verify')
  @Roles(UserRole.SUPER_ADMIN, UserRole.INSPECTOR)
  async verify(
    @Param('id') id: string,
    @Body() verifyDto: VerifyTransactionDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return this.transactionsService.verify(id, verifyDto, currentUser);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return this.transactionsService.remove(id, currentUser);
  }
}