import { Module } from '@nestjs/common';
import { AdminChainController } from './chain.controller';
import { AdminChainService } from './chain.service';

@Module({ controllers: [AdminChainController], providers: [AdminChainService] })
/** 装配产业链基础信息与图谱管理能力。 */
export class AdminChainModule {}
