import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";

@Injectable()
export class CostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.CostUncheckedCreateInput) {

          const { distribution, ...rest } = data as any;
          return this.prisma.cost.create({
            data: {
              ...rest,
              distribution: distribution ? {
                create: distribution
              } : undefined
            },
            include: {
              distribution: true,
            },
          });
  }

  async findById(id: string) {
    return this.prisma.cost.findUnique({
      where: { id },
      include: {
        distribution: {
          include: {
            member: true,
          },
        },
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

  async delete(id: string) {
    // Also delete associated distributions
    await this.prisma.costDistribution.deleteMany({
      where: { costId: id },
    });

    return this.prisma.cost.delete({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.CostUncheckedUpdateInput) {

          const { distribution, ...rest } = data as any;
          return this.prisma.cost.update({
            where: { id },
            data: {
              ...rest,
              distribution: distribution ? {
                deleteMany: {},
                create: distribution
              } : undefined
            },
            include: {
              distribution: true,
            },
          });
  }

  async getMessMembers(messId: string) {
    return this.prisma.messMember.findMany({
      where: { messId },
    });
  }
}
