import { Injectable } from "@nestjs/common";
import { BazarDatesRepository } from "../repositories/bazar-dates.repository";

@Injectable()
export class BazarDatesService {
  constructor(private readonly bazarDatesRepository: BazarDatesRepository) {}

  async getMonthAssignments(monthId: string) {
    return this.bazarDatesRepository.findByMonthId(monthId);
  }

  async createAssignment(data: { monthId: string; date: string; memberId: string }) {
    return this.bazarDatesRepository.upsertByMonthDate(data);
  }

  async updateAssignment(id: string, data: { date?: string; memberId?: string }) {
    return this.bazarDatesRepository.update(id, data);
  }

  async deleteAssignment(id: string) {
    return this.bazarDatesRepository.delete(id);
  }
}
