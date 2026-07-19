import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  log(adminId: number | null, module: string, action: string, summary: string, targetType?: string, targetId?: number | string) {
    return this.prisma.auditLog.create({
      data: { adminId, module, action, summary, targetType, targetId: targetId === undefined ? undefined : String(targetId) },
    });
  }
}
