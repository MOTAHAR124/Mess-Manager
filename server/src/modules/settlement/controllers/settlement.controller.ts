import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { SettlementService } from "../services/settlement.service";
import { ApiResponse } from "@/common/dto/response.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse as SwaggerApiResponse } from "@nestjs/swagger";

@Controller("settlement")
@UseGuards(JwtAuthGuard)
@ApiTags('Settlement')
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Get(":monthId")
    @ApiOperation({ summary: 'Get Settlement' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async getSettlement(@Param("monthId") monthId: string) {
    const settlement = await this.settlementService.getSettlement(monthId);
    return ApiResponse.success(settlement);
  }

  @Post(":monthId/calculate")
    @ApiOperation({ summary: 'Calculate' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async calculate(@Param("monthId") monthId: string) {
    const settlement =
      await this.settlementService.calculateSettlement(monthId);
    return ApiResponse.success(
      settlement,
      "Settlement calculated successfully",
    );
  }
}
