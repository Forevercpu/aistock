import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({ controllers: [HealthController] })
/** 提供无需鉴权的服务健康检查接口。 */
export class HealthModule {}
