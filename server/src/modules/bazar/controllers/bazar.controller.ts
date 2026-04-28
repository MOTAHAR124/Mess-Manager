import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RoleGuard } from "../../auth/guards/role.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { User } from "../../auth/decorators/user.decorator";
import { BazarService } from "../services/bazar.service";
import { CreateBazarDto, BazarResponseDto } from "../dto/bazar.dto";
import { ApiResponse } from "../../../common/dto/response.dto";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse as SwaggerApiResponse } from "@nestjs/swagger";

@Controller("bazar")
@UseGuards(JwtAuthGuard)
@ApiTags('Bazar')
export class BazarController {
  constructor(private readonly bazarService: BazarService) {}

  @Post("assign")
  @UseGuards(RoleGuard)
  @Roles("MANAGER")
  @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Assign Member' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async assignMember(@Body() dto: CreateBazarDto): Promise<ApiResponse<BazarResponseDto>> {
    const data = await this.bazarService.assignMember(dto);
    return ApiResponse.success(data, "Member assigned to bazar date successfully");
  }

  @Get("upcoming/:monthId")
  @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get Upcoming Dates' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async getUpcomingDates(@Param("monthId") monthId: string): Promise<ApiResponse<BazarResponseDto[]>> {
    const data = await this.bazarService.getUpcomingDates(monthId);
    return ApiResponse.success(data);
  }

  @Get("mine/:monthId")
  @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get Personal Dates' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async getPersonalDates(
    @User("id") userId: string,
    @Param("monthId") monthId: string,
  ): Promise<ApiResponse<BazarResponseDto[]>> {
    const data = await this.bazarService.getPersonalDates(userId, monthId);
    return ApiResponse.success(data);
  }

  @Delete(":id")
  @UseGuards(RoleGuard)
  @Roles("MANAGER")
  @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Remove Assignment' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async removeAssignment(@Param("id") id: string): Promise<ApiResponse<void>> {
    await this.bazarService.removeAssignment(id);
    return ApiResponse.success(undefined, "Bazar assignment removed successfully");
  }
}
