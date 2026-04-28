import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import {
  AdminDashboardStatsDto,
  PaginatedResponseDto,
  MessSummaryDto,
  ManagerDashboardSummaryDto,
  MemberSummaryDto,
  RecentActivityDto,
  QuickStatsDto,
} from "../dto/dashboard.dto";

/**
 * Dashboard Service
 *
 * Handles aggregation and calculation of dashboard data
 * Uses database queries and caching for performance
 */
@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get admin dashboard statistics
   * Aggregates system-wide data
   */
  async getAdminStats(): Promise<AdminDashboardStatsDto> {
    const [
      totalUsers,
      totalMesses,
      totalMembers,
      mealStats,
      costStats,
      depositStats,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.mess.count(),
      this.prisma.messMember.count(),
      this.prisma.meal.aggregate({
        _sum: { breakfast: true, lunch: true, dinner: true },
      }),
      this.prisma.cost.aggregate({
        _sum: { amount: true },
      }),
      this.prisma.deposit.aggregate({
        _sum: { amount: true },
      }),
    ]);

    const activeMesses = await this.prisma.month.count({
      where: { status: "ACTIVE" },
    });

    const totalCosts = costStats._sum.amount || 0;
    const totalDeposits = depositStats._sum.amount || 0;
    const totalMeals =
      (mealStats._sum.breakfast || 0) +
      (mealStats._sum.lunch || 0) +
      (mealStats._sum.dinner || 0);

    return {
      totalUsers,
      totalMesses,
      activeMesses,
      totalMembers,
      totalTransactions:
        (await this.prisma.deposit.count()) + (await this.prisma.cost.count()),
      totalMealCost: totalCosts, // Total costs documented in the system
      totalDeposits,
      totalBalance: totalDeposits - totalCosts,
      totalMeals,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get recently created messes with cursor-based pagination
   */
  async getRecentMesses(
    pageSize: number,
    cursor?: string,
  ): Promise<PaginatedResponseDto<MessSummaryDto>> {
    const messes = await this.prisma.mess.findMany({
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    const hasMore = messes.length > pageSize;
    const data = messes.slice(0, pageSize);
    const nextCursor = hasMore ? data[data.length - 1]?.id : null;

    return {
      data: data.map((mess) => ({
        id: mess.id,
        name: mess.name,
        createdBy: mess.managerId,
        memberCount: mess._count.members,
        lastActivityDate: mess.updatedAt,
        createdAt: mess.createdAt,
      })),
      cursor: nextCursor,
      pageSize,
      hasMore,
    };
  }

  /**
   * Get top messes by activity
   */
  async getTopMesses(
    pageSize: number,
    cursor?: string,
  ): Promise<PaginatedResponseDto<MessSummaryDto>> {
    const messes = await this.prisma.mess.findMany({
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        members: { _count: "desc" },
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    const hasMore = messes.length > pageSize;
    const data = messes.slice(0, pageSize);

    return {
      data: data.map((mess) => ({
        id: mess.id,
        name: mess.name,
        createdBy: mess.managerId,
        memberCount: mess._count.members,
        lastActivityDate: mess.updatedAt,
        createdAt: mess.createdAt,
      })),
      cursor: hasMore ? data[data.length - 1]?.id : null,
      pageSize,
      hasMore,
    };
  }

  /**
   * Get manager's mess summary
   */
  async getManagerSummary(
    userId: string,
    messId: string,
  ): Promise<ManagerDashboardSummaryDto> {
    // Verify manager access
    const isManager = await this.prisma.messMember.findFirst({
      where: {
        messId,
        userId,
        role: "MANAGER",
      },
    });

    if (!isManager) {
      throw new ForbiddenException("You are not a manager of this mess");
    }

    const mess = await this.prisma.mess.findUniqueOrThrow({
      where: { id: messId },
    });

    const activeMonth = await this.prisma.month.findFirst({
      where: { messId, status: "ACTIVE" },
    });

    if (!activeMonth) {
      throw new BadRequestException("No active month for this mess");
    }

    const [
      totalMembers,
      mealStats,
      individualCostStats,
      sharedCostStats,
      depositStats,
    ] = await Promise.all([
      this.prisma.messMember.count({ where: { messId } }),
      this.prisma.meal.aggregate({
        where: { monthId: activeMonth.id },
        _sum: { breakfast: true, lunch: true, dinner: true },
      }),
      this.prisma.cost.aggregate({
        where: { monthId: activeMonth.id, type: "INDIVIDUAL" },
        _sum: { amount: true },
      }),
      this.prisma.cost.aggregate({
        where: { monthId: activeMonth.id, type: "SHARED" },
        _sum: { amount: true },
      }),
      this.prisma.deposit.aggregate({
        where: { monthId: activeMonth.id },
        _sum: { amount: true },
      }),
    ]);

    const totalMeals =
      (mealStats._sum.breakfast || 0) +
      (mealStats._sum.lunch || 0) +
      (mealStats._sum.dinner || 0);

    const totalSharedCosts = sharedCostStats._sum.amount || 0;
    const totalIndividualCosts = individualCostStats._sum.amount || 0;
    const totalDeposits = depositStats._sum.amount || 0;
    const totalCosts = totalSharedCosts + totalIndividualCosts;

    return {
      messId,
      messName: mess.name,
      monthId: activeMonth.id,
      monthName: activeMonth.name,
      totalMembers,
      totalMeals,
      totalMealCost: totalCosts,
      totalSharedCosts,
      totalIndividualCosts,
      totalDeposits,
      totalBalance: totalDeposits - totalCosts,
      averageMealCost: totalMeals > 0 ? totalCosts / totalMeals : 0,
    };
  }

  /**
   * Get members summary with pagination
   */
  async getMembersSummary(
    userId: string,
    messId: string,
    pageSize: number,
    cursor?: string,
  ): Promise<PaginatedResponseDto<MemberSummaryDto>> {
    // Verify manager access
    const isManager = await this.prisma.messMember.findFirst({
      where: {
        messId,
        userId,
        role: "MANAGER",
      },
    });

    if (!isManager) {
      throw new ForbiddenException("You are not a manager of this mess");
    }

    const activeMonth = await this.prisma.month.findFirst({
      where: { messId, status: "ACTIVE" },
    });

    if (!activeMonth) {
      throw new BadRequestException("No active month for this mess");
    }

    const members = await this.prisma.messMember.findMany({
      where: { messId },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        user: {
          include: {
            meals: { where: { monthId: activeMonth.id } },
            deposits: { where: { monthId: activeMonth.id } },
            costDist: {
              include: {
                cost: true,
              },
              where: {
                cost: { monthId: activeMonth.id },
              },
            },
          },
        },
      },
    });

    const hasMore = members.length > pageSize;
    const data = members.slice(0, pageSize);

    return {
      data: data.map((member) => {
        const meals = member.user.meals.reduce(
          (acc, m) => acc + m.breakfast + m.lunch + m.dinner,
          0,
        );
        const individualCosts = member.user.costDist
          .filter((d) => d.cost.type === "INDIVIDUAL")
          .reduce((acc, d) => acc + d.amount, 0);
        const sharedCosts = member.user.costDist
          .filter((d) => d.cost.type === "SHARED")
          .reduce((acc, d) => acc + d.amount, 0);
        const totalDeposits = member.user.deposits.reduce(
          (acc, d) => acc + d.amount,
          0,
        );

        const totalCost = individualCosts + sharedCosts;

        return {
          id: member.userId,
          name: member.user.firstName + " " + member.user.lastName,
          email: member.user.email,
          profilePicture: member.user.profilePicture || undefined,
          totalMeals: meals,
          totalMealCost: 0,
          totalIndividualCosts: individualCosts,
          shareInSharedCosts: sharedCosts,
          totalDeposits: totalDeposits,
          balance: totalDeposits - totalCost,
        };
      }),
      cursor: hasMore ? (data[data.length - 1]?.id as string) : null,
      pageSize,
      hasMore,
    };
  }

  /**
   * Get recent activities with pagination
   */
  async getRecentActivities(
    userId: string,
    messId: string,
    pageSize: number,
    _cursor?: string,
  ): Promise<PaginatedResponseDto<RecentActivityDto>> {
    const isManager = await this.prisma.messMember.findFirst({
      where: {
        messId,
        userId,
        role: "MANAGER",
      },
    });

    if (!isManager) {
      throw new ForbiddenException("You are not a manager of this mess");
    }

    const [meals, costs, deposits] = await Promise.all([
      this.prisma.meal.findMany({
        where: { messId },
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: { member: true },
      }),
      this.prisma.cost.findMany({
        where: { messId },
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: { distribution: { include: { member: true } } },
      }),
      this.prisma.deposit.findMany({
        where: { messId },
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: { member: true },
      }),
    ]);

    const activities: RecentActivityDto[] = [
      ...meals.map((m) => ({
        id: m.id,
        type: "MEAL" as const,
        amount: m.breakfast + m.lunch + m.dinner,
        date: m.date,
        memberId: m.memberId,
        memberName: m.member.firstName + " " + m.member.lastName,
        description: `Logged ${m.breakfast + m.lunch + m.dinner} meals`,
        createdAt: m.createdAt,
      })),
      ...costs.map((c) => ({
        id: c.id,
        type: "COST" as const,
        amount: c.amount,
        date: c.createdAt,
        memberId: c.memberId || "system",
        memberName: c.memberId ? "Multiple" : "System",
        description: `Expense: ${c.name}`,
        createdAt: c.createdAt,
      })),
      ...deposits.map((d) => ({
        id: d.id,
        type: "DEPOSIT" as const,
        amount: d.amount,
        date: d.date,
        memberId: d.memberId,
        memberName: d.member.firstName + " " + d.member.lastName,
        description: `Deposit recorded`,
        createdAt: d.createdAt,
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, pageSize);

    return {
      data: activities,
      cursor:
        activities.length > 0 ? activities[activities.length - 1].id : null,
      pageSize,
      hasMore: false,
    };
  }

  /**
   * Get quick stats for dashboard cards
   */
  async getQuickStats(userId: string, messId: string): Promise<QuickStatsDto> {
    const isMember = await this.prisma.messMember.findFirst({
      where: {
        messId,
        userId,
      },
    });

    if (!isMember) {
      throw new ForbiddenException("You are not a member of this mess");
    }

    const activeMonth = await this.prisma.month.findFirst({
      where: { messId, status: "ACTIVE" },
    });

    if (!activeMonth) {
      throw new BadRequestException("No active month for this mess");
    }

    const [totalMembers, depositStats, costStats] = await Promise.all([
      this.prisma.messMember.count({ where: { messId } }),
      this.prisma.deposit.aggregate({
        where: { monthId: activeMonth.id },
        _sum: { amount: true },
      }),
      this.prisma.cost.aggregate({
        where: { monthId: activeMonth.id },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = depositStats._sum.amount || 0;
    const totalExpense = costStats._sum.amount || 0;

    return {
      totalIncome,
      totalExpense,
      totalMembers,
      averagePerMember: totalMembers > 0 ? totalExpense / totalMembers : 0,
      pendingSettlements: 0,
    };
  }
}
