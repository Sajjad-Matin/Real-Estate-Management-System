import { Module, Global } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { AuditService } from './services/audit.service';
import { AuditController } from './controller/audit.controller';
import { PaginationService } from './services/pagination.service';
import { AuditLogService } from './services/audit-log.service';

@Global() // Makes it available everywhere
@Module({
  controllers: [AuditController],
  providers: [EmailService, AuditService, PaginationService, AuditLogService],
  exports: [EmailService, AuditService, PaginationService, AuditLogService],
})
export class CommonModule {}