import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from "@nestjs/common";
import { MealsService } from "../services/meals.service";
import { ApiResponse } from "@/common/dto/response.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CreateMealDto, UpdateMealDto } from "../dto/create-meal.dto";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse as SwaggerApiResponse } from "@nestjs/swagger";

@Controller("meals")
@UseGuards(JwtAuthGuard)
@ApiTags('Meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Post("bulk")
    @ApiOperation({ summary: 'Upsert Meals' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async upsertMeals(@Body("meals") meals: CreateMealDto[]) {
    const result = await this.mealsService.upsertMeals(meals);
    return ApiResponse.success(result, "Meals updated successfully");
  }

  @Get("month/:monthId")
    @ApiOperation({ summary: 'Get By Month' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async getByMonth(
    @Param("monthId") monthId: string,
    @Query("limit") limit?: number,
    @Query("cursor") cursor?: string,
  ) {
    const result = await this.mealsService.getMealsByMonth(
      monthId,
      limit ? +limit : 20,
      cursor,
    );
    return ApiResponse.success(result.data, "Success", {
      timestamp: new Date().toISOString(),
      pagination: {
        page: 1,
        pageSize: limit ? +limit : 20,
        total: result.data.length,
        hasMore: result.hasMore,
        cursor: result.nextCursor,
      },
    });
  }

  @Get(":id")
    @ApiOperation({ summary: 'Get Meal' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async getMeal(@Param("id") id: string) {
    const meal = await this.mealsService.getMealById(id);
    return ApiResponse.success(meal);
  }

  @Put(":id")
    @ApiOperation({ summary: 'Update Meal' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async updateMeal(
    @Param("id") id: string,
    @Body() data: UpdateMealDto,
  ) {
    const meal = await this.mealsService.updateMeal(id, data);
    return ApiResponse.success(meal, "Meal updated successfully");
  }

  @Delete(":id")
    @ApiOperation({ summary: 'Delete Meal' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async deleteMeal(@Param("id") id: string) {
    await this.mealsService.deleteMeal(id);
    return ApiResponse.success(null, "Meal deleted successfully");
  }
}
