import { IsString, IsNotEmpty, IsDateString, IsEnum } from "class-validator";
import { MonthStatus } from "@prisma/client";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateMonthDto {
  @IsString()
  @IsNotEmpty()
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  messId: string;

  @IsString()
  @IsNotEmpty()
    @ApiProperty({ example: 'Sample Name' })
  name: string;

  @IsDateString()
    @ApiProperty({ example: '2026-04-10T10:00:00Z' })
  startDate: string;

  @IsDateString()
    @ApiProperty({ example: '2026-04-10T10:00:00Z' })
  endDate: string;
}

export class UpdateMonthDto {
  @IsString()
    @ApiPropertyOptional({ example: 'Sample Name' })
  name?: string;

  @IsDateString()
    @ApiPropertyOptional({ example: '2026-04-10T10:00:00Z' })
  startDate?: string;

  @IsDateString()
    @ApiPropertyOptional({ example: '2026-04-10T10:00:00Z' })
  endDate?: string;

  @IsEnum(MonthStatus)
    @ApiPropertyOptional({ example: 'ACTIVE' })
  status?: MonthStatus;
}

export class MonthResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    messId: string;
  @ApiProperty({ example: 'Sample Name' })
    name: string;
  @ApiProperty({ example: 'ACTIVE' })
    status: MonthStatus;
  @ApiProperty({ example: '2026-04-10T10:00:00Z' })
    startDate: Date;
  @ApiProperty({ example: '2026-04-10T10:00:00Z' })
    endDate: Date;
  @ApiProperty({ example: '2026-04-10T10:00:00Z' })
    createdAt: Date;
  @ApiProperty({ example: '2026-04-10T10:00:00Z' })
    updatedAt: Date;
}
