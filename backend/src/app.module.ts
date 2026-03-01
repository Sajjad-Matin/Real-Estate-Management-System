import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AgenciesModule } from './agencies/agencies.module';
import { CommonModule } from './common/common.module';
import { UsersModule } from './users/users.module';
import { PropertiesModule } from './properties/properties.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [AuthModule, PrismaModule, AgenciesModule, CommonModule, UsersModule, PropertiesModule, TransactionsModule],
})
export class AppModule {}
