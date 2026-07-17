import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: '服务健康检查' })
  check() {
    return { status: 'ok', service: 'aistock-be', timestamp: new Date().toISOString() };
  }
}

