import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommonModule } from 'src/common/common.module';
import { PaginationService } from 'src/common/services/pagination.service';
import { AuditLogService } from 'src/audit-log/audit-log.service';

@Module({
  imports: [PrismaModule, CommonModule], // ✅ Make sure CommonModule is here
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
