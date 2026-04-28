import { Injectable } from "@nestjs/common";
import { DepositsRepository } from "../repositories/deposits.repository";
import { RecordDepositDto, UpdateDepositDto } from "../dto/deposit.dto";

@Injectable()
export class DepositsService {
  constructor(private readonly depositsRepository: DepositsRepository) {}

  async recordDeposit(data: RecordDepositDto) {
    return this.depositsRepository.create(data);
  }

  async getDeposits(monthId: string) {
    return this.depositsRepository.findByMonthId(monthId);
  }

  async deleteDeposit(id: string) {
    return this.depositsRepository.delete(id);
  }

  async updateDeposit(id: string, data: UpdateDepositDto) {
    return this.depositsRepository.update(id, data);
  }
}
