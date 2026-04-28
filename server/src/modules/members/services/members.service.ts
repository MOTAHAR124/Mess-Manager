import { Injectable } from "@nestjs/common";
import { MembersRepository } from "../repositories/members.repository";
import { } from "@prisma/client";

@Injectable()
export class MembersService {
  constructor(private readonly membersRepository: MembersRepository) {}

  async addMemberByEmail(
    messId: string,
    email: string,
    firstName?: string,
    lastName?: string,
  ) {
    return this.membersRepository.addMemberByEmail(
      messId,
      email,
      firstName,
      lastName,
    );
  }

  async getMemberById(id: string) {
    return this.membersRepository.findById(id);
  }

  async removeMember(id: string) {
    return this.membersRepository.delete(id);
  }

  async updateRole(id: string, role: string) {
      return this.membersRepository.update(id, { role: role as any });
  }

  async getMessMembers(messId: string) {
    return this.membersRepository.findByMessId(messId);
  }

  async updateMember(
    id: string,
    data: { firstName?: string; lastName?: string; role?: string },
  ) {
    return this.membersRepository.updateMemberProfile(id, data);
  }
}
