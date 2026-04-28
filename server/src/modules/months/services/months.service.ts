import { Injectable } from "@nestjs/common";
import { MonthsRepository } from "../repositories/months.repository";
import { CreateMonthDto, UpdateMonthDto } from "../dto/create-month.dto";

@Injectable()
export class MonthsService {
  constructor(private readonly monthsRepository: MonthsRepository) {}

  async createMonth(data: CreateMonthDto) {
    return this.monthsRepository.create(data);
  }

  async getMonthById(id: string) {
    return this.monthsRepository.findById(id);
  }

  async activateMonth(id: string) {
    return this.monthsRepository.activateMonth(id);
  }

  async completeMonth(id: string) {
    return this.monthsRepository.completeMonth(id);
  }

  async getMessMonths(messId: string) {
    return this.monthsRepository.findByMessId(messId);
  }

  async updateMonth(id: string, data: UpdateMonthDto) {
    return this.monthsRepository.update(id, data);
  }

  async deleteMonth(id: string) {
    return this.monthsRepository.delete(id);
  }
}
