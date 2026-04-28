import { Injectable } from "@nestjs/common";
import { MealsRepository } from "../repositories/meals.repository";
import { CreateMealDto, UpdateMealDto } from "../dto/create-meal.dto";

@Injectable()
export class MealsService {
  constructor(private readonly mealsRepository: MealsRepository) {}

  async upsertMeals(meals: CreateMealDto[]) {
    return this.mealsRepository.upsertMany(meals);
  }

  async getMealsByMonth(monthId: string, limit: number = 20, cursor?: string) {
    const meals = await this.mealsRepository.findByMonthId(
      monthId,
      limit,
      cursor,
    );

    let nextCursor: string | null = null;
    if (meals.length > limit) {
      const nextItem = meals.pop();
      nextCursor = nextItem?.id || null;
    }

    return {
      data: meals,
      nextCursor,
      hasMore: !!nextCursor,
    };
  }

  async getMealById(id: string) {
    return this.mealsRepository.findById(id);
  }

  async updateMeal(id: string, data: UpdateMealDto) {
    return this.mealsRepository.update(id, data);
  }

  async deleteMeal(id: string) {
    return this.mealsRepository.delete(id);
  }
}
