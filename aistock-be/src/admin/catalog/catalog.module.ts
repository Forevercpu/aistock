import { Module } from '@nestjs/common';
import { AdminCatalogController } from './catalog.controller';
import { AdminCatalogService } from './catalog.service';

@Module({ controllers: [AdminCatalogController], providers: [AdminCatalogService] })
/** 装配板块、概念和标签管理能力。 */
export class AdminCatalogModule {}
