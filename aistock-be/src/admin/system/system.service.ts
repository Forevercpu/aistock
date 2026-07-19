import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AdminSystemService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  /** 查询全部同步任务及最近执行状态。 */
  getTasks() { return this.prisma.syncTask.findMany({ orderBy: { updatedAt: 'desc' } }); }

  /** 执行当前模拟同步任务并记录执行次数和审计日志。 */
  async runTask(id: number, adminId: number) {
    const task = await this.prisma.syncTask.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('同步任务不存在');
    const completed = await this.prisma.syncTask.update({ where: { id }, data: { status: 'SUCCESS', lastRunAt: new Date(), errorMessage: null, runCount: { increment: 1 }, lastResult: { message: '模拟任务执行成功', affectedRows: 0 } } });
    await this.audit.log(adminId, 'system', 'sync', `执行同步任务“${task.name}”`, 'SyncTask', id);
    return completed;
  }

  /** 查询最近审计日志，并把数量限制在 1 到 200 条。 */
  getAuditLogs(limit = 50) {
    return this.prisma.auditLog.findMany({ take: Math.min(Math.max(limit, 1), 200), include: { admin: { select: { id: true, displayName: true, username: true } } }, orderBy: { createdAt: 'desc' } });
  }
}
