import { Module } from '@nestjs/common';
import { AdminCompanyController } from './company.controller';
import { AdminCompanyService } from './company.service';

@Module({ controllers: [AdminCompanyController], providers: [AdminCompanyService] })
export class AdminCompanyModule {}
