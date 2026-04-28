import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsEnum, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CostType } from "@prisma/client";

export class CostDistributionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  memberId: string;

  @IsNumber()
  @Min(0)
  @ApiProperty()
  amount: number;
}

export class CreateCostDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  monthId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  messId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsNumber()
  @Min(0)
  @ApiProperty()
  amount: number;

  @IsEnum(CostType)
  @ApiProperty({ enum: CostType })
  type: CostType;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  memberId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  details?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CostDistributionDto)
  @ApiPropertyOptional({ type: [CostDistributionDto] })
  distribution?: CostDistributionDto[];
}

export class UpdateCostDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional()
  amount?: number;

  @IsOptional()
  @IsEnum(CostType)
  @ApiPropertyOptional({ enum: CostType })
  type?: CostType;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  memberId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  details?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CostDistributionDto)
  @ApiPropertyOptional({ type: [CostDistributionDto] })
  distribution?: CostDistributionDto[];
}

export class CostResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  monthId: string;

  @ApiProperty()
  messId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  amount: number;

  @ApiProperty({ enum: CostType })
  type: CostType;

  @ApiPropertyOptional()
  memberId?: string;

  @ApiPropertyOptional({ type: [CostDistributionDto] })
  distribution?: CostDistributionDto[];

  @ApiPropertyOptional()
  details?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;
}
