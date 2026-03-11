import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole, AgencyStatus, VerificationStatus } from '@prisma/client';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getSuperAdminStats() {
    const [
      totalProperties,
      totalAgencies,
      activeAgencies,
      bannedAgencies,
      pendingVerifications,
      totalInspectors,
      totalTransactions,
      pendingTransactions,
      approvedTransactions,
      rejectedTransactions,
    ] = await Promise.all([
      this.prisma.property.count(),
      this.prisma.agency.count(),
      this.prisma.agency.count({ where: { status: AgencyStatus.ACTIVE } }),
      this.prisma.agency.count({ where: { status: AgencyStatus.BANNED } }),
      this.prisma.tradeTransaction.count({
        where: { status: VerificationStatus.PENDING },
      }),
      this.prisma.user.count({ where: { role: UserRole.INSPECTOR } }),
      this.prisma.tradeTransaction.count(),
      this.prisma.tradeTransaction.count({
        where: { status: VerificationStatus.PENDING },
      }),
      this.prisma.tradeTransaction.count({
        where: { status: VerificationStatus.APPROVED },
      }),
      this.prisma.tradeTransaction.count({
        where: { status: VerificationStatus.REJECTED },
      }),
    ]);

    return {
      totalProperties,
      totalAgencies,
      activeAgencies,
      bannedAgencies,
      pendingVerifications,
      totalInspectors,
      totalTransactions,
      pendingTransactions,
      approvedTransactions,
      rejectedTransactions,
    };
  }

  async getAgencyAdminStats(agencyId: string) {
    const [
      totalProperties,
      totalTransactions,
      pendingTransactions,
      approvedTransactions,
      rejectedTransactions,
    ] = await Promise.all([
      this.prisma.property.count({ where: { agencyId } }),
      this.prisma.tradeTransaction.count({ where: { agencyId } }),
      this.prisma.tradeTransaction.count({
        where: { agencyId, status: VerificationStatus.PENDING },
      }),
      this.prisma.tradeTransaction.count({
        where: { agencyId, status: VerificationStatus.APPROVED },
      }),
      this.prisma.tradeTransaction.count({
        where: { agencyId, status: VerificationStatus.REJECTED },
      }),
    ]);

    return {
      totalProperties,
      totalTransactions,
      pendingTransactions,
      approvedTransactions,
      rejectedTransactions,
    };
  }

  async getInspectorStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count all pending verifications (system-wide)
    const pendingVerifications = await this.prisma.tradeTransaction.count({
      where: { status: VerificationStatus.PENDING },
    });

    // Count verifications done by this inspector today
    const todayCompleted = await this.prisma.tradeTransaction.count({
      where: {
        status: { not: VerificationStatus.PENDING },
        verifications: {
          some: {
            createdAt: { gte: today },
          },
        },
      },
    });

    // Count total verifications by this inspector
    const totalVerified = await this.prisma.tradeTransaction.count({
      where: {
        status: { not: VerificationStatus.PENDING },
        verifications: {
          some: {},
        },
      },
    });

    return {
      pendingVerifications,
      todayCompleted,
      totalVerified,
    };
  }

  async getTransactionTrends(
    days: number,
    userRole: UserRole,
    agencyId?: string,
  ) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: any = {
      createdAt: { gte: startDate },
    };

    if (userRole === UserRole.AGENCY_ADMIN && agencyId) {
      where.agencyId = agencyId;
    }

    const transactions = await this.prisma.tradeTransaction.findMany({
      where,
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const trendsMap = new Map<string, number>();

    transactions.forEach((transaction) => {
      const date = transaction.createdAt.toISOString().split('T')[0];
      trendsMap.set(date, (trendsMap.get(date) || 0) + 1);
    });

    // Convert to array and fill missing dates with 0
    const result: { date: string; count: number }[] = [];
    const currentDate = new Date(startDate);
    const endDate = new Date();

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        count: trendsMap.get(dateStr) || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }

  async getTradeDistribution(userRole: UserRole, agencyId?: string) {
    const where: any = {};

    if (userRole === UserRole.AGENCY_ADMIN && agencyId) {
      where.agencyId = agencyId;
    }

    const transactions = await this.prisma.tradeTransaction.groupBy({
      by: ['tradeType'],
      where,
      _count: true,
    });

    const total = transactions.reduce((sum, t) => sum + t._count, 0);

    return transactions.map((t) => ({
      type: t.tradeType,
      count: t._count,
      percentage: total > 0 ? Math.round((t._count / total) * 100) : 0,
    }));
  }
}