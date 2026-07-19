import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AdminSystemService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  getTasks() { return this.prisma.syncTask.findMany({ orderBy: { updatedAt: 'desc' } }); }

  async runTask(id: number, adminId: number) {
    const task = await this.prisma.syncTask.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('同步任务不存在');
    const completed = await this.prisma.syncTask.update({ where: { id }, data: { status: 'SUCCESS', lastRunAt: new Date(), errorMessage: null, runCount: { increment: 1 }, lastResult: { message: '模拟任务执行成功', affectedRows: 0 } } });
    await this.audit.log(adminId, 'system', 'sync', `执行同步任务“${task.name}”`, 'SyncTask', id);
    return completed;
  }

  getAuditLogs(limit = 50) {
    return this.prisma.auditLog.findMany({ take: Math.min(Math.max(limit, 1), 200), include: { admin: { select: { id: true, displayName: true, username: true } } }, orderBy: { createdAt: 'desc' } });
  }
}
