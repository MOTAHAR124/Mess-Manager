import { IsOptional, IsString, IsNumber, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";

/**
 * Pagination Query DTO
 * Used for cursor-based pagination
 */
export class PaginationQueryDto {
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: 'eyJpZCI6MTIzfQ==' })
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
    @ApiPropertyOptional({ example: 1 })
  pageSize?: number = 20;
}

/**
 * Paginated Response Wrapper
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({ example: 'string' })
    data: T[];
  @ApiProperty({ example: 'eyJpZCI6MTIzfQ==' })
    cursor: string | null;
  @ApiProperty({ example: 1 })
    pageSize: number;
  @ApiProperty({ example: true })
    hasMore: boolean;
  @ApiPropertyOptional({ example: 1 })
    totalCount?: number;
}

/**
 * Admin Dashboard Stats
 */
export class AdminDashboardStatsDto {
  @ApiProperty({ example: 1 })
    totalUsers: number;
  @ApiProperty({ example: 1 })
    totalMesses: number;
  @ApiProperty({ example: 0 })
    activeMesses: number;
  @ApiProperty({ example: 1 })
    totalMembers: number;
  @ApiProperty({ example: 1 })
    totalTransactions: number;
  @ApiProperty({ example: 150.50 })
    totalMealCost: number;
  @ApiProperty({ example: 1 })
    totalDeposits: number;
  @ApiProperty({ example: 150.50 })
    totalBalance: number;
  @ApiProperty({ example: 1 })
    totalMeals: number;
  @ApiProperty({ example: '2026-04-10T10:00:00Z' })
    lastUpdated: Date;
}

/**
 * Mess Summary for Admin
 */
export class MessSummaryDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;
  @ApiProperty({ example: 'Sample Name' })
    name: string;
  @ApiProperty({ example: 'string' })
    createdBy: string;
  @ApiProperty({ example: 1 })
    memberCount: number;
  @ApiProperty({ example: '2026-04-10T10:00:00Z' })
    lastActivityDate: Date;
  @ApiProperty({ example: '2026-04-10T10:00:00Z' })
    createdAt: Date;
}

/**
 * Top Mess Info
 */
export class TopMessDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;
  @ApiProperty({ example: 'Sample Name' })
    name: string;
  @ApiProperty({ example: 1 })
    mealCount: number;
  @ApiProperty({ example: 1 })
    transactionCount: number;
  @ApiProperty({ example: 150.50 })
    totalAmount: number;
  @ApiProperty({ example: 'string' })
    lastActivity: Date;
}

/**
 * Manager Dashboard Summary
 */
export class ManagerDashboardSummaryDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    messId: string;
  @ApiProperty({ example: 'Sample Name' })
    messName: string;
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    monthId: string;
  @ApiProperty({ example: 'Sample Name' })
    monthName: string;
  @ApiProperty({ example: 1 })
    totalMembers: number;
  @ApiProperty({ example: 1 })
    totalMeals: number;
  @ApiProperty({ example: 150.50 })
    totalMealCost: number;
  @ApiProperty({ example: 150.50 })
    totalSharedCosts: number;
  @ApiProperty({ example: 150.50 })
    totalIndividualCosts: number;
  @ApiProperty({ example: 1 })
    totalDeposits: number;
  @ApiProperty({ example: 150.50 })
    totalBalance: number;
  @ApiProperty({ example: 150.50 })
    averageMealCost: number;
}

/**
 * Member Summary with balance (for manager dashboard)
 */
export class MemberSummaryDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;
  @ApiProperty({ example: 'Sample Name' })
    name: string;
  @ApiProperty({ example: 'user@example.com' })
    email: string;
  @ApiPropertyOptional({ example: 'string' })
    profilePicture?: string;
  @ApiProperty({ example: 1 })
    totalMeals: number;
  @ApiProperty({ example: 150.50 })
    totalMealCost: number;
  @ApiProperty({ example: 150.50 })
    totalIndividualCosts: number;
  @ApiProperty({ example: 150.50 })
    shareInSharedCosts: number;
  @ApiProperty({ example: 1 })
    totalDeposits: number;
  @ApiProperty({ example: 150.50 })
    balance: number;
}

/**
 * Recent Activity
 */
export class RecentActivityDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;
  @ApiProperty({ example: 'SHARED' })
    type: "MEAL" | "COST" | "DEPOSIT";
  @ApiProperty({ example: 150.50 })
    amount: number;
  @ApiProperty({ example: '2026-04-10T10:00:00Z' })
    date: Date;
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    memberId: string;
  @ApiProperty({ example: 'Sample Name' })
    memberName: string;
  @ApiProperty({ example: 'Sample description text' })
    description: string;
  @ApiProperty({ example: '2026-04-10T10:00:00Z' })
    createdAt: Date;
}

/**
 * Quick Stats for Dashboard Cards
 */
export class QuickStatsDto {
  @ApiProperty({ example: 1 })
    totalIncome: number; // Total deposits
  @ApiProperty({ example: 1 })
    totalExpense: number; // Total meals + costs
  @ApiProperty({ example: 1 })
    totalMembers: number;
  @ApiProperty({ example: 0 })
    averagePerMember: number;
  @ApiProperty({ example: 0 })
    pendingSettlements: number;
}
