import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import { CreateMessDto, UpdateMessDto } from "../dto/create-mess.dto";

@Injectable()
export class MessRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateMessDto) {
    return this.prisma.$transaction(async (tx) => {
      const mess = await tx.mess.create({
        data: {
          ...data,
          managerId: userId,
        },
      });

      // Automatically add manager as a member
      await tx.messMember.create({
        data: {
          messId: mess.id,
          userId: userId,
          role: "MANAGER",
        },
      });

      return tx.mess.findUnique({
        where: { id: mess.id },
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      });
    });
  }

  async findById(id: string) {
    return this.prisma.mess.findUnique({
      where: { id },
      include: {
        manager: true,
        members: {
          include: {
            user: true,
          },
        },
        activeMonth: true,
      },
    });
  }

  async findCurrentByUserId(userId: string) {
    const membership = await this.prisma.messMember.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
      orderBy: {
        joinedAt: "desc",
      },
      select: {
        messId: true,
      },
    });

    if (!membership) {
      return null;
    }

    return this.findById(membership.messId);
  }

  async update(id: string, data: UpdateMessDto) {
    return this.prisma.mess.update({
      where: { id },
      data,
    });
  }

  async getMembers(messId: string) {
    return this.prisma.messMember.findMany({
      where: { messId },
      include: {
        user: true,
      },
    });
  }

  async addMember(messId: string, userId: string) {
    return this.prisma.messMember.create({
      data: {
        messId,
        userId,
      },
      include: {
        user: true,
      },
    });
  }

  async removeMember(_messId: string, memberId: string) {
    return this.prisma.messMember.delete({
      where: { id: memberId },
    });
  }
}
