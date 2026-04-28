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
import { DepositsService } from "../services/deposits.service";
import { ApiResponse } from "@/common/dto/response.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RecordDepositDto, UpdateDepositDto } from "../dto/deposit.dto";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse as SwaggerApiResponse } from "@nestjs/swagger";

@Controller("deposits")
@UseGuards(JwtAuthGuard)
@ApiTags('Deposits')
export class DepositsController {
  constructor(private readonly depositsService: DepositsService) {}

  @Post()
    @ApiOperation({ summary: 'Record Deposit' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async recordDeposit(@Body() data: RecordDepositDto) {
    const deposit = await this.depositsService.recordDeposit(data);
    return ApiResponse.success(deposit, "Deposit recorded successfully");
  }

  @Get("month/:monthId")
    @ApiOperation({ summary: 'Get Deposits' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async getDeposits(@Param("monthId") monthId: string) {
    const deposits = await this.depositsService.getDeposits(monthId);
    return ApiResponse.success(deposits);
  }

  @Put(":id")
    @ApiOperation({ summary: 'Update Deposit' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async updateDeposit(
    @Param("id") id: string,
    @Body() data: UpdateDepositDto,
  ) {
    const deposit = await this.depositsService.updateDeposit(id, data);
    return ApiResponse.success(deposit, "Deposit updated successfully");
  }

  @Delete(":id")
    @ApiOperation({ summary: 'Delete Deposit' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async deleteDeposit(@Param("id") id: string) {
    await this.depositsService.deleteDeposit(id);
    return ApiResponse.success(null, "Deposit deleted successfully");
  }
}
