import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { CreateBazarDto, BazarResponseDto } from "../dto/bazar.dto";

@Injectable()
export class BazarService {
  constructor(private prisma: PrismaService) {}

  async assignMember(dto: CreateBazarDto): Promise<BazarResponseDto> {
    const { monthId, date, memberId } = dto;

    // Verify member exists and belongs to the mess associated with the month
    const member = await this.prisma.messMember.findUnique({
      where: { id: memberId },
      include: { mess: true },
    });

    if (!member) {
      throw new NotFoundException("Member not found");
    }

    const month = await this.prisma.month.findUnique({
      where: { id: monthId },
    });

    if (!month) {
      throw new NotFoundException("Month not found");
    }

    if (month.messId !== member.messId) {
      throw new BadRequestException("Member does not belong to this mess");
    }

    // Upsert bazar date
    const bazarDate = await this.prisma.bazarDate.upsert({
      where: {
        monthId_date: {
          monthId,
          date: new Date(date),
        },
      },
      update: {
        memberId,
      },
      create: {
        monthId,
        date: new Date(date),
        memberId,
      },
      include: {
        member: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    });

    return {
      id: bazarDate.id,
      monthId: bazarDate.monthId,
      date: bazarDate.date,
      memberId: bazarDate.memberId,
      member: {
        id: bazarDate.memberId,
        user: bazarDate.member.user,
      },
    };
  }

  async getUpcomingDates(monthId: string): Promise<BazarResponseDto[]> {
    const bazarDates = await this.prisma.bazarDate.findMany({
      where: {
        monthId,
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Today onwards
        },
      },
      orderBy: {
        date: "asc",
      },
      include: {
        member: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    });

    return bazarDates.map((bd) => ({
      id: bd.id,
      monthId: bd.monthId,
      date: bd.date,
      memberId: bd.memberId,
      member: {
        id: bd.memberId,
        user: bd.member.user,
      },
    }));
  }

  async removeAssignment(id: string): Promise<void> {
    try {
      await this.prisma.bazarDate.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException("Bazar assignment not found");
    }
  }

  async getPersonalDates(userId: string, monthId: string): Promise<BazarResponseDto[]> {
    const bazarDates = await this.prisma.bazarDate.findMany({
      where: {
        monthId,
        member: {
          userId,
        },
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      orderBy: {
        date: "asc",
      },
      include: {
        member: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    });

    return bazarDates.map((bd) => ({
      id: bd.id,
      monthId: bd.monthId,
      date: bd.date,
      memberId: bd.memberId,
      member: {
        id: bd.memberId,
        user: bd.member.user,
      },
    }));
  }
}
