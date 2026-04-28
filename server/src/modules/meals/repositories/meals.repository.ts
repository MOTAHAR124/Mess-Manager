import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";

@Injectable()
export class MealsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.MealCreateInput) {
    return this.prisma.meal.create({
      data,
      include: {
        member: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.meal.findUnique({
      where: { id },
      include: {
        member: true,
      },
    });
  }

  async findByMonthId(monthId: string, limit: number = 20, cursor?: string) {
    const where: any = { monthId };

    return this.prisma.meal.findMany({
      where,
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { date: "desc" },
      include: {
        member: true,
      },
    });
  }

  async update(id: string, data: Prisma.MealUpdateInput) {
    return this.prisma.meal.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.meal.delete({
      where: { id },
    });
  }

  async upsertMany(meals: Prisma.MealUncheckedCreateInput[]) {
    return this.prisma.$transaction(
      meals.map((meal) => {
        const { id, monthId, messId, memberId, date, ...data } = meal as any;
        return this.prisma.meal.upsert({
          where: {
            monthId_date_memberId: {
              monthId,
              date: new Date(date),
              memberId,
            },
          },
          create: {
            monthId,
            messId,
            memberId,
            date: new Date(date),
            ...data,
          },
          update: data,
        });
      }),
    );
  }
}
