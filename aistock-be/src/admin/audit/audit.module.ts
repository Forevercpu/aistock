import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';

@Global()
@Module({ providers: [AuditService], exports: [AuditService] })
/** 提供全局审计日志记录服务。 */
export class AuditModule {}
