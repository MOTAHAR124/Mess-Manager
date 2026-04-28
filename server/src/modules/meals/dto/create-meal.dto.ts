import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  Min,
  IsOptional,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateMealDto {
  @IsString()
  @IsNotEmpty()
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  monthId: string;

  @IsString()
  @IsNotEmpty()
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  messId: string;

  @IsString()
  @IsNotEmpty()
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  memberId: string;

  @IsDateString()
    @ApiProperty({ example: '2026-04-10T10:00:00Z' })
  date: string;

  @IsNumber()
  @Min(0)
    @ApiProperty({ example: 1 })
  breakfast: number = 0;

  @IsNumber()
  @Min(0)
    @ApiProperty({ example: 1 })
  lunch: number = 0;

  @IsNumber()
  @Min(0)
    @ApiProperty({ example: 1 })
  dinner: number = 0;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: 'Sample description text' })
  details?: string;
}

export class UpdateMealDto {
  @IsNumber()
  @Min(0)
    @ApiPropertyOptional({ example: 1 })
  breakfast?: number;

  @IsNumber()
  @Min(0)
    @ApiPropertyOptional({ example: 1 })
  lunch?: number;

  @IsNumber()
  @Min(0)
    @ApiPropertyOptional({ example: 1 })
  dinner?: number;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: 'Sample description text' })
  details?: string;
}

export class MealResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    monthId: string;
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    messId: string;
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    memberId: string;
  @ApiProperty({ example: '2026-04-10T10:00:00Z' })
    date: Date;
  @ApiProperty({ example: 1 })
    breakfast: number;
  @ApiProperty({ example: 1 })
    lunch: number;
  @ApiProperty({ example: 1 })
    dinner: number;
  @ApiPropertyOptional({ example: 'Sample description text' })
    details?: string;
  @ApiProperty({ example: '2026-04-10T10:00:00Z' })
    createdAt: Date;
  @ApiProperty({ example: '2026-04-10T10:00:00Z' })
    updatedAt: Date;
}
