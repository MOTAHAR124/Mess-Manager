import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { MonthsService } from "../services/months.service";
import { ApiResponse } from "@/common/dto/response.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CreateMonthDto } from "../dto/create-month.dto";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse as SwaggerApiResponse } from "@nestjs/swagger";

@Controller("months")
@UseGuards(JwtAuthGuard)
@ApiTags('Months')
export class MonthsController {
  constructor(private readonly monthsService: MonthsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create Month' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async createMonth(@Body() data: CreateMonthDto) {
    const month = await this.monthsService.createMonth(data);
    return ApiResponse.success(month, "Month created successfully");
  }

  @Get(":id")
    @ApiOperation({ summary: 'Get Month' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async getMonth(@Param("id") id: string) {
    const month = await this.monthsService.getMonthById(id);
    return ApiResponse.success(month);
  }

  @Post(":id/active")
  @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Set Active Month' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async setActiveMonth(@Param("id") id: string) {
    const month = await this.monthsService.activateMonth(id);
    return ApiResponse.success(month, "Month set as active successfully");
  }

  @Post(":id/complete")
  @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Complete Month' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async completeMonth(@Param("id") id: string) {
    const month = await this.monthsService.completeMonth(id);
    return ApiResponse.success(month, "Month completed successfully");
  }

  @Get("mess/:messId")
    @ApiOperation({ summary: 'Get Mess Months' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async getMessMonths(@Param("messId") messId: string) {
    const months = await this.monthsService.getMessMonths(messId);
    return ApiResponse.success(months);
  }

  @Delete(":id")
    @ApiOperation({ summary: 'Delete Month' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async deleteMonth(@Param("id") id: string) {
    const month = await this.monthsService.deleteMonth(id);
    return ApiResponse.success(month, "Month deleted successfully");
  }
}
