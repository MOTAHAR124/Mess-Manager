import { Injectable } from "@nestjs/common";
import { SettlementRepository } from "../repositories/settlement.repository";
import { PrismaService } from "@/common/prisma/prisma.service";

type MemberSettlement = {
  meals: number;
  cost: number;
  deposit: number;
  balance: number;
};

@Injectable()
export class SettlementService {
  constructor(
    private readonly settlementRepository: SettlementRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getSettlement(monthId: string) {
    let settlement = await this.settlementRepository.findByMonthId(monthId);

    if (!settlement) {
      // Calculate settlement if not exists
      settlement = await this.calculateSettlement(monthId);
    }

    return settlement;
  }

  async calculateSettlement(monthId: string) {
    const month = await this.prisma.month.findUnique({
      where: { id: monthId },
      include: {
        meals: true,
        costs: true,
        deposits: true,
        mess: {
          include: {
            members: {
              where: {
                status: "ACTIVE",
              },
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!month) return null;

    const memberData: Record<string, MemberSettlement> = {};

    // Initialize all active members so reports always include zero-balance users.
    month.mess.members.forEach((member) => {
      memberData[member.userId] = {
        meals: 0,
        cost: 0,
        deposit: 0,
        balance: 0,
      };
    });

    // 1) Total meal counts per member.
    let totalMeals = 0;
    month.meals.forEach((meal) => {
      if (!memberData[meal.memberId]) {
        memberData[meal.memberId] = {
          meals: 0,
          cost: 0,
          deposit: 0,
          balance: 0,
        };
      }

      const mealCount = meal.breakfast + meal.lunch + meal.dinner;
      memberData[meal.memberId].meals += mealCount;
      totalMeals += mealCount;
    });

    // 2) Total expense at month level.
    const totalCost = month.costs.reduce((sum, cost) => sum + cost.amount, 0);

    // 3) Total deposits per member.
    let totalDeposit = 0;
    month.deposits.forEach((deposit) => {
      if (!memberData[deposit.memberId]) {
        memberData[deposit.memberId] = {
          meals: 0,
          cost: 0,
          deposit: 0,
          balance: 0,
        };
      }

      memberData[deposit.memberId].deposit += deposit.amount;
      totalDeposit += deposit.amount;
    });

    // 4) Required business formula:
    // meal_rate = total_expense / total_meals
    // user_balance = deposit - (meal_count * meal_rate)
    const mealRate = totalMeals > 0 ? totalCost / totalMeals : 0;
    Object.keys(memberData).forEach((memberId) => {
      const m = memberData[memberId];
      m.cost = m.meals * mealRate;
      m.balance = m.deposit - m.cost;
    });

    return this.settlementRepository.create({
      monthId,
      totalMealCost: totalCost,
      totalMeals,
      totalCost,
      mealRate,
      totalDeposit,
      memberBalances: JSON.stringify(memberData),
    });
  }
}
