import { Module } from '@nestjs/common';
import { AdminSystemController } from './system.controller';
import { AdminSystemService } from './system.service';

@Module({ controllers: [AdminSystemController], providers: [AdminSystemService] })
/** 装配同步任务与审计日志查询能力。 */
export class AdminSystemModule {}
