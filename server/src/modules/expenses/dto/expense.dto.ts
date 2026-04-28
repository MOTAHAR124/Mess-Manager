import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CostType } from "@prisma/client";

export class ExpenseShareDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  memberId: string;

  @IsNumber()
  @Min(0)
  @ApiProperty()
  amount: number;
}

export class CreateExpenseDto {
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
  @IsDateString()
  @ApiPropertyOptional({ description: "Client-side date; cost table currently uses createdAt." })
  date?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ExpenseShareDto)
  @ApiPropertyOptional({ type: [ExpenseShareDto] })
  distribution?: ExpenseShareDto[];
}

export class UpdateExpenseDto {
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
  @Type(() => ExpenseShareDto)
  @ApiPropertyOptional({ type: [ExpenseShareDto] })
  distribution?: ExpenseShareDto[];
}
