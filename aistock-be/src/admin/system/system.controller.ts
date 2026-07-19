import { Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, type AdminRequest } from '../auth/jwt-auth.guard';
import { AdminSystemService } from './system.service';

@ApiTags('admin-system')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/system')
export class AdminSystemController {
  constructor(private readonly service: AdminSystemService) {}

  @Get('sync-tasks')
  @ApiOperation({ summary: '查询数据同步任务' })
  getTasks() { return this.service.getTasks(); }

  @Post('sync-tasks/:id/run')
  @ApiOperation({ summary: '立即执行指定同步任务' })
  runTask(@Param('id', ParseIntPipe) id: number, @Req() req: AdminRequest) { return this.service.runTask(id, req.admin.sub); }

  @Get('audit-logs')
  @ApiOperation({ summary: '查询后台操作审计日志' })
  getAuditLogs(@Query('limit') limit?: string) { return this.service.getAuditLogs(Number(limit) || 50); }
}
