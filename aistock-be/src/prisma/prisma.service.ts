import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  /** 使用 DATABASE_URL 创建 MariaDB 驱动适配器和 Prisma Client。 */
  constructor() {
    const connectionString = process.env.DATABASE_URL ?? 'mysql://aistock:aistock@localhost:3306/aistock';
    super({ adapter: new PrismaMariaDb(connectionString) });
  }

  /** Nest 应用关闭时主动释放数据库连接池。 */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
