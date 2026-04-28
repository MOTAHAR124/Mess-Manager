import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import { MonthStatus } from "@prisma/client";
import { CreateMonthDto, UpdateMonthDto } from "../dto/create-month.dto";

@Injectable()
export class MonthsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMonthDto) {
    return this.prisma.$transaction(async (tx) => {
      await tx.month.updateMany({
        where: {
          messId: data.messId,
          status: "ACTIVE" as MonthStatus,
        },
        data: {
          status: "COMPLETED" as MonthStatus,
        },
      });

      const month = await tx.month.create({
        data: {
          ...data,
          status: "ACTIVE" as MonthStatus,
        },
      });

      await tx.mess.update({
        where: { id: data.messId },
        data: { activeMonthId: month.id },
      });

      return month;
    });
  }

  async findById(id: string) {
    return this.prisma.month.findUnique({
      where: { id },
      include: {
        meals: true,
        costs: true,
        deposits: true,
        settlement: true,
      },
    });
  }

  async findByMessId(messId: string) {
    return this.prisma.month.findMany({
      where: { messId },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, data: UpdateMonthDto) {
    return this.prisma.month.update({
      where: { id },
      data,
    });
  }

  async activateMonth(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const month = await tx.month.findUnique({ where: { id } });

      if (!month) return null;

      // Deactivate all other months for this mess
      await tx.month.updateMany({
        where: {
          messId: month.messId,
          id: { not: id },
          status: "ACTIVE" as MonthStatus,
        },
        data: {
          status: "COMPLETED" as MonthStatus,
        },
      });

      // Activate this month
      const updatedMonth = await tx.month.update({
        where: { id },
        data: {
          status: "ACTIVE" as MonthStatus,
        },
      });

      // Update Mess activeMonthId
      await tx.mess.update({
        where: { id: month.messId },
        data: { activeMonthId: id },
      });

      return updatedMonth;
    });
  }

  async completeMonth(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const month = await tx.month.findUnique({ where: { id } });
      if (!month) return null;

      // Mark month as completed
      const updatedMonth = await tx.month.update({
        where: { id },
        data: { status: "COMPLETED" as MonthStatus },
      });

      // Clear mess activeMonthId if this was the active one
      await tx.mess.updateMany({
        where: { id: month.messId, activeMonthId: id },
        data: { activeMonthId: null },
      });

      return updatedMonth;
    });
  }

  async delete(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const month = await tx.month.findUnique({
        where: { id },
      });

      if (!month) {
        return null;
      }

      await tx.mess.updateMany({
        where: {
          id: month.messId,
          activeMonthId: id,
        },
        data: {
          activeMonthId: null,
        },
      });

      return tx.month.delete({
        where: { id },
      });
    });
  }
}
