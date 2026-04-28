import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RoleGuard } from "../../auth/guards/role.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { User } from "../../auth/decorators/user.decorator";
import { DashboardService } from "../services/dashboard.service";
import {
  PaginationQueryDto,
  AdminDashboardStatsDto,
  PaginatedResponseDto,
  MessSummaryDto,
  ManagerDashboardSummaryDto,
  MemberSummaryDto,
  RecentActivityDto,
  QuickStatsDto,
} from "../dto/dashboard.dto";
import { ApiResponse } from "../../../common/dto/response.dto";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse as SwaggerApiResponse } from "@nestjs/swagger";

/**
 * Dashboard Controller
 *
 * Handles dashboard endpoints for:
 * - Admin overview and statistics
 * - Manager mess-specific summaries
 * - Real-time aggregations
 */
@Controller("dashboard")
@UseGuards(JwtAuthGuard)
@ApiTags('Dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard/admin/stats
   * Get system-wide admin statistics (ADMIN only)
   */
  @Get("admin/stats")
  @UseGuards(RoleGuard)
  @Roles("ADMIN")
  @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get Admin Stats' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async getAdminStats(): Promise<ApiResponse<AdminDashboardStatsDto>> {
    const data = await this.dashboardService.getAdminStats();
    return ApiResponse.success(data);
  }

  /**
   * GET /dashboard/admin/recent-messes
   * Get recently created messes with pagination (ADMIN only)
   */
  @Get("admin/recent-messes")
  @UseGuards(RoleGuard)
  @Roles("ADMIN")
  @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get Recent Messes' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async getRecentMesses(
    @Query() query: PaginationQueryDto,
  ): Promise<ApiResponse<PaginatedResponseDto<MessSummaryDto>>> {
    const data = await this.dashboardService.getRecentMesses(
      query.pageSize || 20,
      query.cursor,
    );
    return ApiResponse.success(data);
  }

  /**
   * GET /dashboard/manager/:messId/summary
   * Get manager's mess summary (MANAGER of that mess)
   */
  @Get("manager/:messId/summary")
  @UseGuards(RoleGuard)
  @Roles("MANAGER")
  @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get Manager Summary' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async getManagerSummary(
    @User("id") userId: string,
    @Param("messId") messId: string,
  ): Promise<ApiResponse<ManagerDashboardSummaryDto>> {
    const data = await this.dashboardService.getManagerSummary(userId, messId);
    return ApiResponse.success(data);
  }

  /**
   * GET /dashboard/manager/:messId/members
   * Get all members summary with pagination (MANAGER only)
   */
  @Get("manager/:messId/members")
  @UseGuards(RoleGuard)
  @Roles("MANAGER")
  @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get Members Summary' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async getMembersSummary(
    @User("id") userId: string,
    @Param("messId") messId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<ApiResponse<PaginatedResponseDto<MemberSummaryDto>>> {
    const data = await this.dashboardService.getMembersSummary(
      userId,
      messId,
      query.pageSize || 20,
      query.cursor,
    );
    return ApiResponse.success(data);
  }

  /**
   * GET /dashboard/manager/:messId/activity
   * Get recent meal, cost, deposit entries (MANAGER only)
   */
  @Get("manager/:messId/activity")
  @UseGuards(RoleGuard)
  @Roles("MANAGER")
  @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get Recent Activities' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async getRecentActivities(
    @User("id") userId: string,
    @Param("messId") messId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<ApiResponse<PaginatedResponseDto<RecentActivityDto>>> {
    const data = await this.dashboardService.getRecentActivities(
      userId,
      messId,
      query.pageSize || 20,
      query.cursor,
    );
    return ApiResponse.success(data);
  }

  /**
   * GET /dashboard/manager/:messId/quick-stats
   * Get quick statistics cards (MANAGER only)
   */
  @Get("manager/:messId/quick-stats")
  @UseGuards(RoleGuard)
  @Roles("MANAGER")
  @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get Quick Stats' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async getQuickStats(
    @User("id") userId: string,
    @Param("messId") messId: string,
  ): Promise<ApiResponse<QuickStatsDto>> {
    const data = await this.dashboardService.getQuickStats(userId, messId);
    return ApiResponse.success(data);
  }
}
