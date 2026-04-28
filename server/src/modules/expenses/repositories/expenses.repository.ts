import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";

export type ExpenseWritePayload = Omit<Prisma.CostUncheckedCreateInput, "distribution"> & {
  distribution?: { memberId: string; amount: number }[];
};

@Injectable()
export class ExpensesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: ExpenseWritePayload) {
    const { distribution, ...rest } = data;

    return this.prisma.cost.create({
      data: {
        ...rest,
        distribution: distribution
          ? {
              create: distribution,
            }
          : undefined,
      },
      include: {
        distribution: true,
      },
    });
  }

  async findByMonthId(monthId: string) {
    return this.prisma.cost.findMany({
      where: { monthId },
      include: {
        distribution: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, data: ExpenseWritePayload) {
    const { distribution, ...rest } = data;

    return this.prisma.cost.update({
      where: { id },
      data: {
        ...rest,
        distribution: distribution
          ? {
              deleteMany: {},
              create: distribution,
            }
          : undefined,
      },
      include: {
        distribution: true,
      },
    });
  }

  async delete(id: string) {
    await this.prisma.costDistribution.deleteMany({
      where: { costId: id },
    });

    return this.prisma.cost.delete({
      where: { id },
    });
  }

  async getActiveMessMembers(messId: string) {
    return this.prisma.messMember.findMany({
      where: {
        messId,
        status: "ACTIVE",
      },
      select: {
        userId: true,
      },
    });
  }
}
