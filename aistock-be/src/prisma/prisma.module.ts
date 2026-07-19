import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({ providers: [PrismaService], exports: [PrismaService] })
/** 全局提供单例 PrismaService，避免业务模块重复创建连接池。 */
export class PrismaModule {}
