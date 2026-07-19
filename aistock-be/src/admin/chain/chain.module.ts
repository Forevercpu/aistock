import { Module } from '@nestjs/common';
import { AdminChainController } from './chain.controller';
import { AdminChainService } from './chain.service';

@Module({ controllers: [AdminChainController], providers: [AdminChainService] })
export class AdminChainModule {}
