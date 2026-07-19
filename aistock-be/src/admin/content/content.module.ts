import { Module } from '@nestjs/common';
import { AdminContentController } from './content.controller';
import { AdminContentService } from './content.service';

@Module({ controllers: [AdminContentController], providers: [AdminContentService] })
export class AdminContentModule {}
