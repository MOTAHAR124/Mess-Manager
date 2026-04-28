import { IsString, IsNotEmpty, MinLength, MaxLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateMessDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
    @ApiProperty({ example: 'Sample Name' })
  name: string;
}

export class UpdateMessDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
    @ApiPropertyOptional({ example: 'Sample Name' })
  name?: string;
}

export class MessResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;
  @ApiProperty({ example: 'Sample Name' })
    name: string;
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    managerId: string;
  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
    activeMonthId?: string;
  @ApiProperty({ example: '2026-04-10T10:00:00Z' })
    createdAt: Date;
  @ApiProperty({ example: '2026-04-10T10:00:00Z' })
    updatedAt: Date;
}
