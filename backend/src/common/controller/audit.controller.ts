import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService, AuditAction } from '../services/audit.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN) // Only SUPER_ADMIN can view audit logs
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async findAll(
    @Query('userId') userId?: string,
    @Query('action') action?: AuditAction,
    @Query('entity') entity?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.findAll({
      userId,
      action,
      entity,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('entity/:entity/:entityId')
  async findByEntity(
    @Query('entity') entity: string,
    @Query('entityId') entityId: string,
  ) {
    return this.auditService.findByEntity(entity, entityId);
  }

  @Get('user/:userId')
  async findByUser(@Query('userId') userId: string) {
    return this.auditService.findByUser(userId);
  }
}