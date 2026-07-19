import { Module } from '@nestjs/common';
import { AdminDashboardController } from './dashboard.controller';
import { AdminDashboardService } from './dashboard.service';

@Module({ controllers: [AdminDashboardController], providers: [AdminDashboardService] })
/** 装配管理后台数据总览统计接口。 */
export class AdminDashboardModule {}
