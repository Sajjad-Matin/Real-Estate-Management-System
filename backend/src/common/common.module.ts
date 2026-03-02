import { Module, Global } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { AuditService } from './services/audit.service';
import { AuditController } from './controller/audit.controller';

@Global() // Makes it available everywhere
@Module({
  controllers: [AuditController],
  providers: [EmailService, AuditService],
  exports: [EmailService, AuditService],
})
export class CommonModule {}