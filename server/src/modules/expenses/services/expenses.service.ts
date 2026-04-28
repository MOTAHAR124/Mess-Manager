import { BadRequestException, Injectable } from "@nestjs/common";
import { CostType, Prisma } from "@prisma/client";
import {
  ExpenseWritePayload,
  ExpensesRepository,
} from "../repositories/expenses.repository";
import { CreateExpenseDto, UpdateExpenseDto } from "../dto/expense.dto";

@Injectable()
export class ExpensesService {
  constructor(private readonly expensesRepository: ExpensesRepository) {}

  async createExpense(data: CreateExpenseDto) {
    const payload = await this.buildCreatePayload(data);
    return this.expensesRepository.create(payload);
  }

  async getExpensesByMonth(monthId: string) {
    return this.expensesRepository.findByMonthId(monthId);
  }

  async updateExpense(id: string, data: UpdateExpenseDto) {
    const payload = await this.buildUpdatePayload(id, data);
    return this.expensesRepository.update(id, payload);
  }

  async deleteExpense(id: string) {
    return this.expensesRepository.delete(id);
  }

  private async buildCreatePayload(
    input: CreateExpenseDto,
  ): Promise<ExpenseWritePayload> {
    const payload: ExpenseWritePayload = {
      ...(input as Omit<Prisma.CostUncheckedCreateInput, "distribution">),
    };

    if (input.type === CostType.SHARED) {
      const messId = input.messId;
      if (!messId) {
        throw new BadRequestException("messId is required for shared expense distribution");
      }

      const members = await this.expensesRepository.getActiveMessMembers(messId);
      if (members.length === 0) {
        throw new BadRequestException("Cannot split shared expense: no active members found");
      }

      const amount = input.amount ?? 0;
      const splitAmount = amount / members.length;

      payload.distribution = members.map((member) => ({
        memberId: member.userId,
        amount: splitAmount,
      }));
      return payload;
    }

    if (input.type === CostType.INDIVIDUAL && input.memberId) {
      const amount = input.amount ?? 0;
      payload.distribution = [
        {
          memberId: input.memberId,
          amount,
        },
      ];
      return payload;
    }

    return payload;
  }

  private async buildUpdatePayload(id: string, input: UpdateExpenseDto): Promise<ExpenseWritePayload> {
    const payload: ExpenseWritePayload = {
      id,
      ...(input as Omit<Prisma.CostUncheckedCreateInput, "distribution">),
    };

    if (input.type === CostType.SHARED) {
      throw new BadRequestException("Updating SHARED expense requires full payload with messId and amount");
    }

    if (input.type === CostType.INDIVIDUAL && input.memberId && input.amount !== undefined) {
      payload.distribution = [
        {
          memberId: input.memberId,
          amount: input.amount,
        },
      ];
    }

    return payload;
  }
}
