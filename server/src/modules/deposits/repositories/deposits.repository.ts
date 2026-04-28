import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class DepositsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.DepositUncheckedCreateInput) {
    return this.prisma.deposit.create({
      data,
      include: {
        member: true,
      },
    });
  }

  async findByMonthId(monthId: string) {
    return this.prisma.deposit.findMany({
      where: { monthId },
      include: {
        member: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async delete(id: string) {
    return this.prisma.deposit.delete({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.DepositUncheckedUpdateInput) {
    return this.prisma.deposit.update({
      where: { id },
      data,
      include: {
        member: true,
      },
    });
  }
}
