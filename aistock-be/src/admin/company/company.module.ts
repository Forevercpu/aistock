import { Module } from '@nestjs/common';
import { AdminCompanyController } from './company.controller';
import { AdminCompanyService } from './company.service';

@Module({ controllers: [AdminCompanyController], providers: [AdminCompanyService] })
/** 装配上市公司及主营产品管理能力。 */
export class AdminCompanyModule {}
