import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import * as bcrypt from "bcryptjs";

@Injectable()
export class MembersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.MessMemberCreateInput) {
    return this.prisma.messMember.create({
      data,
      include: {
        user: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.messMember.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  async findByMessId(messId: string) {
    return this.prisma.messMember.findMany({
      where: { messId },
      include: {
        user: true,
      },
    });
  }

  async update(id: string, data: Prisma.MessMemberUpdateInput) {
    return this.prisma.messMember.update({
      where: { id },
      data,
      include: {
        user: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.messMember.delete({
      where: { id },
    });
  }

  async addMemberByEmail(
    messId: string,
    email: string,
    firstName?: string,
    lastName?: string,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    const user =
      existingUser ||
      (await this.prisma.user.create({
        data: await (async () => {
          const generatedPassword = this.generateMemberPassword();
          const passwordHash = await bcrypt.hash(generatedPassword, 10);

          return {
            email,
            firstName: firstName || email.split("@")[0] || "Member",
            lastName: lastName || "",
            isVerified: false,
            passwordHash,
            rawPass: generatedPassword,
          };
        })(),
      }));

    const existingMembership = await this.prisma.messMember.findFirst({
      where: {
        messId,
        userId: user.id,
      },
      include: {
        user: true,
      },
    });

    if (existingMembership) {
      return existingMembership;
    }

    return this.prisma.messMember.create({
      data: {
        messId,
        userId: user.id,
      },
      include: {
        user: true,
      },
    });
  }

  async updateMemberProfile(
    id: string,
    data: { firstName?: string; lastName?: string; role?: string },
  ) {
    const member = await this.prisma.messMember.findUnique({
      where: { id },
    });

    if (!member) {
      return null;
    }

    return this.prisma.$transaction(async (tx) => {
      if (data.firstName !== undefined || data.lastName !== undefined) {
        await tx.user.update({
          where: { id: member.userId },
          data: {
            ...(data.firstName !== undefined ? { firstName: data.firstName } : {}),
            ...(data.lastName !== undefined ? { lastName: data.lastName } : {}),
          },
        });
      }

      return tx.messMember.update({
        where: { id },
        data: data.role ? { role: data.role as any } : {},
        include: {
          user: true,
        },
      });
    });
  }

  private generateMemberPassword() {
    return `meso-${Math.random().toString(36).slice(2, 10)}`;
  }
}
