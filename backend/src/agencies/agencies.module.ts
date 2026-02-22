import { Module } from '@nestjs/common';
import { AgenciesService } from './agencies.service';
import { AgenciesController } from './agencies.controller';

@Module({
  controllers: [AgenciesController],
  providers: [AgenciesService],
})
export class AgenciesModule {}
