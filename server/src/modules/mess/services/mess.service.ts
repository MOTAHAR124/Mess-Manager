import { Injectable } from "@nestjs/common";
import { MessRepository } from "../repositories/mess.repository";
import { CreateMessDto, UpdateMessDto } from "../dto/create-mess.dto";

@Injectable()
export class MessService {
  constructor(private readonly messRepository: MessRepository) {}

  async createMess(userId: string, data: CreateMessDto) {
    return this.messRepository.create(userId, data);
  }

  async getMessById(id: string) {
    return this.messRepository.findById(id);
  }

  async getCurrentMess(userId: string) {
    return this.messRepository.findCurrentByUserId(userId);
  }

  async updateMess(id: string, data: UpdateMessDto) {
    return this.messRepository.update(id, data);
  }

  async getMembers(messId: string) {
    return this.messRepository.getMembers(messId);
  }

  async addMember(messId: string, userId: string) {
    return this.messRepository.addMember(messId, userId);
  }

  async removeMember(messId: string, memberId: string) {
    return this.messRepository.removeMember(messId, memberId);
  }
}
