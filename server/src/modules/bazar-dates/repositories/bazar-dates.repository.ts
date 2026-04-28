import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";

@Injectable()
export class BazarDatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByMonthId(monthId: string) {
    return this.prisma.bazarDate.findMany({
      where: { monthId },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });
  }

  async upsertByMonthDate(data: { monthId: string; date: string; memberId: string }) {
    return this.prisma.bazarDate.upsert({
      where: {
        monthId_date: {
          monthId: data.monthId,
          date: new Date(data.date),
        },
      },
      update: {
        memberId: data.memberId,
      },
      create: {
        monthId: data.monthId,
        date: new Date(data.date),
        memberId: data.memberId,
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async update(id: string, data: { date?: string; memberId?: string }) {
    return this.prisma.bazarDate.update({
      where: { id },
      data: {
        ...(data.date ? { date: new Date(data.date) } : {}),
        ...(data.memberId ? { memberId: data.memberId } : {}),
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.bazarDate.delete({
      where: { id },
    });
  }
}
