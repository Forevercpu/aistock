import { Module } from '@nestjs/common';
import { AdminContentController } from './content.controller';
import { AdminContentService } from './content.service';

@Module({ controllers: [AdminContentController], providers: [AdminContentService] })
/** 装配公告、AI 审核和题库管理能力。 */
export class AdminContentModule {}
