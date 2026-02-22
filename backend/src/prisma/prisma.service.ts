import { PrismaClient } from '@prisma/client';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // No need to await $connect()
    console.log('PrismaService initialized');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
