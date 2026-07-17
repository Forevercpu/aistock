import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL ?? 'mysql://aistock:aistock@localhost:3306/aistock';
    super({ adapter: new PrismaMariaDb(connectionString) });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
