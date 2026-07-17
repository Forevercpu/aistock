import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    if (!process.env.DATABASE_URL) {
      return { companies: 0, sectors: 0, announcements: 0, pendingReviews: 0, databaseConnected: false };
    }

    try {
      const [companies, sectors, announcements, pendingReviews] = await Promise.all([
        this.prisma.company.count(),
        this.prisma.sector.count(),
        this.prisma.announcement.count(),
        this.prisma.announcement.count({ where: { reviewStatus: 'PENDING' } }),
      ]);
      return { companies, sectors, announcements, pendingReviews, databaseConnected: true };
    } catch {
      return { companies: 0, sectors: 0, announcements: 0, pendingReviews: 0, databaseConnected: false };
    }
  }
}
