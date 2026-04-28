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
import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiResponse } from "@/common/dto/response.dto";
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import { BazarDatesService } from "../services/bazar-dates.service";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse as SwaggerApiResponse } from "@nestjs/swagger";

class UpsertBazarDateDto {
  @IsString()
  @IsNotEmpty()
  monthId: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  memberId: string;
}

class UpdateBazarDateDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  memberId?: string;
}

@Controller("bazar-dates")
@UseGuards(JwtAuthGuard)
@ApiTags('Bazar-dates')
export class BazarDatesController {
  constructor(private readonly bazarDatesService: BazarDatesService) {}

  @Get("month/:monthId")
    @ApiOperation({ summary: 'Get Month Assignments' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async getMonthAssignments(@Param("monthId") monthId: string) {
    const data = await this.bazarDatesService.getMonthAssignments(monthId);
    return ApiResponse.success(data);
  }

  @Post()
    @ApiOperation({ summary: 'Create Assignment' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async createAssignment(@Body() dto: UpsertBazarDateDto) {
    const data = await this.bazarDatesService.createAssignment(dto);
    return ApiResponse.success(data, "Bazar date created successfully");
  }

  @Put(":id")
    @ApiOperation({ summary: 'Update Assignment' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async updateAssignment(@Param("id") id: string, @Body() dto: UpdateBazarDateDto) {
    const data = await this.bazarDatesService.updateAssignment(id, dto);
    return ApiResponse.success(data, "Bazar date updated successfully");
  }

  @Delete(":id")
    @ApiOperation({ summary: 'Delete Assignment' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async deleteAssignment(@Param("id") id: string) {
    await this.bazarDatesService.deleteAssignment(id);
    return ApiResponse.success(null, "Bazar date deleted successfully");
  }
}
