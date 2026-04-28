import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";

@Injectable()
export class SettlementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByMonthId(monthId: string) {
    return this.prisma.settlement.findUnique({
      where: { monthId },
    });
  }

  async create(data: Prisma.SettlementUncheckedCreateInput) {
    const exists = await this.prisma.settlement.findUnique({
      where: { monthId: data.monthId as string },
    });

    if (exists) {
      return this.update(data.monthId as string, data);
    }

    return this.prisma.settlement.create({
      data,
    });
  }

  async update(monthId: string, data: Prisma.SettlementUncheckedUpdateInput) {
    return this.prisma.settlement.update({
      where: { monthId },
      data,
    });
  }
}
