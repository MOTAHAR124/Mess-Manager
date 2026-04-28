import { Injectable } from "@nestjs/common";
import { CostsRepository } from "../repositories/costs.repository";
import { CreateCostDto, UpdateCostDto } from "../dto/cost.dto";

@Injectable()
export class CostsService {
  constructor(private readonly costsRepository: CostsRepository) {}

  async calculateDistribution(data: CreateCostDto | UpdateCostDto) {

          const processed = { ...data } as any;
          if (processed.type === "SHARED") {
            const members = await this.costsRepository.getMessMembers(processed.messId);
            const splitAmount = processed.amount / members.length;
            processed.distribution = members.map((m: any) => ({
              memberId: m.userId,
              amount: splitAmount,
            }));
          } else if (processed.type === "INDIVIDUAL" && processed.memberId) {
            processed.distribution = [
              {
                memberId: processed.memberId,
                amount: processed.amount,
              },
            ];
          }
          return processed;
  }

  async addCost(data: CreateCostDto) {
    const processedData = await this.calculateDistribution(data);
    return this.costsRepository.create(processedData);
  }

  async getCosts(monthId: string) {
    return this.costsRepository.findByMonthId(monthId);
  }

  async updateCost(id: string, data: UpdateCostDto) {
    const processedData = await this.calculateDistribution(data);
    return this.costsRepository.update(id, processedData);
  }

  async deleteCost(id: string) {
    return this.costsRepository.delete(id);
  }
}
