import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse as SwaggerApiResponse, ApiTags } from "@nestjs/swagger";
import { ApiResponse } from "@/common/dto/response.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CreateExpenseDto, UpdateExpenseDto } from "../dto/expense.dto";
import { ExpensesService } from "../services/expenses.service";

@Controller("expenses")
@UseGuards(JwtAuthGuard)
@ApiTags("Expenses")
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: "Add Expense" })
  @ApiBearerAuth("access-token")
  @SwaggerApiResponse({ status: 200, description: "Success" })
  async createExpense(@Body() data: CreateExpenseDto) {
    const expense = await this.expensesService.createExpense(data);
    return ApiResponse.success(expense, "Expense added successfully");
  }

  @Get("month/:monthId")
  @ApiOperation({ summary: "Get Expenses By Month" })
  @ApiBearerAuth("access-token")
  @SwaggerApiResponse({ status: 200, description: "Success" })
  async getExpensesByMonth(@Param("monthId") monthId: string) {
    const expenses = await this.expensesService.getExpensesByMonth(monthId);
    return ApiResponse.success(expenses);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update Expense" })
  @ApiBearerAuth("access-token")
  @SwaggerApiResponse({ status: 200, description: "Success" })
  async updateExpense(@Param("id") id: string, @Body() data: UpdateExpenseDto) {
    const expense = await this.expensesService.updateExpense(id, data);
    return ApiResponse.success(expense, "Expense updated successfully");
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete Expense" })
  @ApiBearerAuth("access-token")
  @SwaggerApiResponse({ status: 200, description: "Success" })
  async deleteExpense(@Param("id") id: string) {
    await this.expensesService.deleteExpense(id);
    return ApiResponse.success(null, "Expense deleted successfully");
  }
}
