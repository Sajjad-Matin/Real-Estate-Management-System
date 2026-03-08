import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { SearchAuditLogDto } from './dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators';
import { UserRole } from '@prisma/client';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  findAll(@Query() searchDto: SearchAuditLogDto) {
    return this.auditLogService.findAll(searchDto);
  }

  @Get('stats')
  getStats() {
    return this.auditLogService.getStats();
  }

  @Get('entity/:entity/:entityId')
  findByEntity(
    @Param('entity') entity: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditLogService.findByEntity(entity, entityId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.auditLogService.findByUser(userId);
  }
}