import { Module } from '@nestjs/common';
import { AdminCatalogController } from './catalog.controller';
import { AdminCatalogService } from './catalog.service';

@Module({ controllers: [AdminCatalogController], providers: [AdminCatalogService] })
export class AdminCatalogModule {}
