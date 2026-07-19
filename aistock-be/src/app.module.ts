import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AdminDashboardModule } from './admin/dashboard/dashboard.module';
import { AdminAuthModule } from './admin/auth/auth.module';
import { AdminCompanyModule } from './admin/company/company.module';
import { AuditModule } from './admin/audit/audit.module';
import { AdminCatalogModule } from './admin/catalog/catalog.module';
import { AdminChainModule } from './admin/chain/chain.module';
import { AdminContentModule } from './admin/content/content.module';
import { AdminSystemModule } from './admin/system/system.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuditModule,
    HealthModule,
    AdminAuthModule,
    AdminDashboardModule,
    AdminCompanyModule,
    AdminCatalogModule,
    AdminChainModule,
    AdminContentModule,
    AdminSystemModule,
  ],
})
/** 后端根模块，集中装配数据库、鉴权和各管理业务模块。 */
export class AppModule {}
