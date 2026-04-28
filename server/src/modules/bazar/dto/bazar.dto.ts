import { IsString, IsNotEmpty, IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateBazarDto {
  @IsString()
  @IsNotEmpty()
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  monthId: string;

  @IsDateString()
  @IsNotEmpty()
    @ApiProperty({ example: '2026-04-10T10:00:00Z' })
  date: string;

  @IsString()
  @IsNotEmpty()
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  memberId: string;
}

export class BazarResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    monthId: string;
  @ApiProperty({ example: '2026-04-10T10:00:00Z' })
    date: Date;
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    memberId: string;
  @ApiProperty({ example: 'string' })
    member: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      profilePicture?: string | null;
    };
  };
}
