import { IsOptional, IsString, IsEmail, MinLength, MaxLength } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @ApiPropertyOptional()
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @ApiPropertyOptional()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional()
  email?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  phone?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  address?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  profilePicture?: string;
}
