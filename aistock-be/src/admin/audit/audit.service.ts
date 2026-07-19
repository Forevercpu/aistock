import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /** 记录管理员对业务数据的关键变更，供系统管理页追溯。 */
  log(adminId: number | null, module: string, action: string, summary: string, targetType?: string, targetId?: number | string) {
    return this.prisma.auditLog.create({
      data: { adminId, module, action, summary, targetType, targetId: targetId === undefined ? undefined : String(targetId) },
    });
  }
}
