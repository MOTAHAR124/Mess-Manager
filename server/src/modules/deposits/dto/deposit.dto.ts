import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsDateString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RecordDepositDto {
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
  memberId: string;

  @IsNumber()
  @Min(0)
  @ApiProperty()
  amount: number;

  @IsDateString()
  @ApiProperty()
  date: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  details?: string;
}

export class UpdateDepositDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional()
  amount?: number;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional()
  date?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  details?: string;
}

export class DepositResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  monthId: string;

  @ApiProperty()
  messId: string;

  @ApiProperty()
  memberId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  date: Date;

  @ApiPropertyOptional()
  details?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;
}
