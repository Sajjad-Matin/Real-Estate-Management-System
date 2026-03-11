import { Controller, Get, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators';
import { UserRole } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { CurrentUser as CurrentUserType } from 'src/common/types';

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('super-admin')
  @Roles(UserRole.SUPER_ADMIN)
  getSuperAdminStats() {
    return this.statsService.getSuperAdminStats();
  }

  @Get('agency-admin')
  @Roles(UserRole.AGENCY_ADMIN)
  getAgencyAdminStats(@CurrentUser() user: CurrentUserType) {
    return this.statsService.getAgencyAdminStats(user.agencyId!);
  }

  @Get('inspector')
  @Roles(UserRole.INSPECTOR)
  getInspectorStats(@CurrentUser() user: CurrentUserType) {
    return this.statsService.getInspectorStats(user.id);
  }

  @Get('transaction-trends')
  @Roles(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.INSPECTOR)
  getTransactionTrends(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.statsService.getTransactionTrends(
      days,
      user.role,
      user.agencyId ?? undefined,
    );
  }

  @Get('trade-distribution')
  @Roles(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN)
  getTradeDistribution(@CurrentUser() user: CurrentUserType) {
    return this.statsService.getTradeDistribution(user.role, user.agencyId ?? undefined);
  }
}