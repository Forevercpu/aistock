import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    if (!process.env.DATABASE_URL) {
      return this.emptyOverview();
    }

    try {
      const since = new Date();
      since.setDate(since.getDate() - 29);
      since.setHours(0, 0, 0, 0);
      const [companies, sectors, announcements, pendingReviews, chains, quizzes, companyStatuses, reviewStatuses, sectorRanking, recentLogs, trendLogs] = await Promise.all([
        this.prisma.company.count(),
        this.prisma.sector.count(),
        this.prisma.announcement.count(),
        this.prisma.aiParseResult.count({ where: { status: 'PENDING' } }),
        this.prisma.industryChain.count(),
        this.prisma.quizQuestion.count({ where: { status: 'PUBLISHED' } }),
        this.prisma.company.groupBy({ by: ['status'], _count: { status: true } }),
        this.prisma.announcement.groupBy({ by: ['reviewStatus'], _count: { reviewStatus: true } }),
        this.prisma.sector.findMany({ take: 8, include: { _count: { select: { companies: true } } }, orderBy: { companies: { _count: 'desc' } } }),
        this.prisma.auditLog.findMany({ take: 8, include: { admin: { select: { displayName: true } } }, orderBy: { createdAt: 'desc' } }),
        this.prisma.auditLog.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
      ]);
      const [companiesWithProducts, companiesWithRelations, reviewedAnnouncements] = await Promise.all([
        this.prisma.company.count({ where: { products: { some: {} } } }),
        this.prisma.company.count({ where: { OR: [{ sectors: { some: {} } }, { tags: { some: {} } }] } }),
        this.prisma.announcement.count({ where: { reviewStatus: { not: 'PENDING' } } }),
      ]);
      const trendMap = new Map<string, number>();
      for (let offset = 0; offset < 30; offset += 1) { const date = new Date(since); date.setDate(since.getDate() + offset); trendMap.set(date.toISOString().slice(0, 10), 0); }
      trendLogs.forEach((item) => { const key = item.createdAt.toISOString().slice(0, 10); trendMap.set(key, (trendMap.get(key) ?? 0) + 1); });
      return {
        companies, sectors, announcements, pendingReviews, chains, quizzes, databaseConnected: true,
        companyStatuses: companyStatuses.map((item) => ({ name: item.status, value: item._count.status })),
        reviewStatuses: reviewStatuses.map((item) => ({ name: item.reviewStatus, value: item._count.reviewStatus })),
        sectorRanking: sectorRanking.map((item) => ({ name: item.name, value: item._count.companies })),
        completeness: {
          products: companies ? Math.round(companiesWithProducts / companies * 100) : 0,
          relations: companies ? Math.round(companiesWithRelations / companies * 100) : 0,
          aiReviews: announcements ? Math.round(reviewedAnnouncements / announcements * 100) : 0,
        },
        recentLogs,
        activityTrend: [...trendMap].map(([date, value]) => ({ date, value })),
      };
    } catch {
      return this.emptyOverview();
    }
  }

  private emptyOverview() {
    return { companies: 0, sectors: 0, announcements: 0, pendingReviews: 0, chains: 0, quizzes: 0, databaseConnected: false, companyStatuses: [], reviewStatuses: [], sectorRanking: [], completeness: { products: 0, relations: 0, aiReviews: 0 }, recentLogs: [], activityTrend: [] };
  }
}
