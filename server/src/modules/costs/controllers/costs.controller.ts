import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { CostsService } from "../services/costs.service";
import { ApiResponse } from "@/common/dto/response.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CreateCostDto, UpdateCostDto } from "../dto/cost.dto";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse as SwaggerApiResponse } from "@nestjs/swagger";

@Controller("costs")
@UseGuards(JwtAuthGuard)
@ApiTags('Costs')
export class CostsController {
  constructor(private readonly costsService: CostsService) {}

  @Post()
    @ApiOperation({ summary: 'Add Cost' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async addCost(@Body() data: CreateCostDto) {
    const cost = await this.costsService.addCost(data);
    return ApiResponse.success(cost, "Cost added successfully");
  }

  @Get("month/:monthId")
    @ApiOperation({ summary: 'Get Costs' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async getCosts(@Param("monthId") monthId: string) {
    const costs = await this.costsService.getCosts(monthId);
    return ApiResponse.success(costs);
  }

  @Put(":id")
    @ApiOperation({ summary: 'Update Cost' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async updateCost(
    @Param("id") id: string,
    @Body() data: UpdateCostDto,
  ) {
    const cost = await this.costsService.updateCost(id, data);
    return ApiResponse.success(cost, "Cost updated successfully");
  }

  @Delete(":id")
    @ApiOperation({ summary: 'Delete Cost' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async deleteCost(@Param("id") id: string) {
    await this.costsService.deleteCost(id);
    return ApiResponse.success(null, "Cost deleted successfully");
  }
}
