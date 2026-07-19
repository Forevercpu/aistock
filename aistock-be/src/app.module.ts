import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AdminDashboardModule } from './admin/dashboard/dashboard.module';
import { AdminAuthModule } from './admin/auth/auth.module';
import { AdminCompanyModule } from './admin/company/company.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AdminAuthModule,
    AdminDashboardModule,
    AdminCompanyModule,
  ],
})
export class AppModule {}
