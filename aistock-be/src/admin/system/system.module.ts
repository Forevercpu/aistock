import { Module } from '@nestjs/common';
import { AdminSystemController } from './system.controller';
import { AdminSystemService } from './system.service';

@Module({ controllers: [AdminSystemController], providers: [AdminSystemService] })
export class AdminSystemModule {}
