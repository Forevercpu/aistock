import { Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, type AdminRequest } from '../auth/jwt-auth.guard';
import { AdminSystemService } from './system.service';

@ApiTags('admin-system')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/system')
export class AdminSystemController {
  constructor(private readonly service: AdminSystemService) {}
  @Get('sync-tasks') getTasks() { return this.service.getTasks(); }
  @Post('sync-tasks/:id/run') runTask(@Param('id', ParseIntPipe) id: number, @Req() req: AdminRequest) { return this.service.runTask(id, req.admin.sub); }
  @Get('audit-logs') getAuditLogs(@Query('limit') limit?: string) { return this.service.getAuditLogs(Number(limit) || 50); }
}
