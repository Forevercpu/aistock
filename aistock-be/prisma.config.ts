import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: {
    // 命令行迁移和生成操作与运行时共用同一个 DATABASE_URL。
    url: process.env.DATABASE_URL ?? 'mysql://aistock:aistock@localhost:3306/aistock',
  },
});
