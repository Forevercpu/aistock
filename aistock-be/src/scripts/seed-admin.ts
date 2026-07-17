import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { hash } from 'bcryptjs';
import { PrismaClient } from '../generated/prisma/client';

async function seedAdmin() {
  const databaseUrl = process.env.DATABASE_URL;
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!databaseUrl) throw new Error('缺少 DATABASE_URL');
  if (!password || password.startsWith('请设置')) throw new Error('请先在 .env 中设置 ADMIN_INITIAL_PASSWORD');

  const prisma = new PrismaClient({ adapter: new PrismaMariaDb(databaseUrl) });
  const username = process.env.ADMIN_INITIAL_USERNAME ?? 'admin';
  const displayName = process.env.ADMIN_INITIAL_DISPLAY_NAME ?? '管理员';
  const passwordHash = await hash(password, 12);

  try {
    const admin = await prisma.adminUser.upsert({
      where: { username },
      create: { username, passwordHash, displayName, role: 'admin', enabled: true },
      update: { passwordHash, displayName, enabled: true },
      select: { id: true, username: true, displayName: true },
    });
    console.log(`管理员已创建或更新：${admin.username}（ID: ${admin.id}）`);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

