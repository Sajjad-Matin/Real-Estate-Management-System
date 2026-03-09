import { Module, Global } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { AuditService } from './services/audit.service';
import { AuditController } from './controller/audit.controller';
import { PaginationService } from './services/pagination.service';
import { AuditLoggerService } from './services/audit-logger.service';

@Global() // Makes it available everywhere
@Module({
  controllers: [AuditController],
  providers: [EmailService, AuditService, PaginationService, AuditLoggerService],
  exports: [EmailService, AuditService, PaginationService, AuditLoggerService],
})
export class CommonModule {}