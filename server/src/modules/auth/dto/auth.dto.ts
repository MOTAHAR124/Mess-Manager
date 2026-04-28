import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsNotEmpty,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Login DTO for email/password authentication
 */
export class LoginDto {
  @IsEmail({}, { message: "Please provide a valid email address" })
    @ApiProperty({ example: 'user@example.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
    @ApiProperty({ example: 'StrongP@ssw0rd1!' })
  password: string;
}

/**
 * Register DTO for user registration
 * Password requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character (!@#$%^&*)
 */
export class RegisterDto {
  @IsEmail({}, { message: "Please provide a valid email address" })
    @ApiProperty({ example: 'user@example.com' })
  email: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  @MaxLength(100)
    @ApiProperty({ example: 'StrongP@ssw0rd1!' })
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
    @ApiProperty({ example: 'John' })
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
    @ApiProperty({ example: 'Doe' })
  lastName: string;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: '+1234567890' })
  phone?: string;
}

/**
 * Verify Email DTO
 */
export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
    @ApiProperty({ example: 'jwt.token.string' })
  token: string;
}

/**
 * Refresh Token DTO
 */
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
    @ApiProperty({ example: 'jwt.token.string' })
  refreshToken: string;
}

/**
 * Change Password DTO
 */
export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
    @ApiProperty({ example: 'StrongP@ssw0rd1!' })
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message:
      "Password must contain uppercase letter, number, and special character",
  })
    @ApiProperty({ example: 'StrongP@ssw0rd1!' })
  newPassword: string;
}

/**
 * Reset Password Request DTO
 */
export class ResetPasswordRequestDto {
  @IsEmail()
    @ApiProperty({ example: 'user@example.com' })
  email: string;
}

/**
 * Reset Password DTO
 */
export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
    @ApiProperty({ example: 'jwt.token.string' })
  token: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message:
      "Password must contain uppercase letter, number, and special character",
  })
    @ApiProperty({ example: 'StrongP@ssw0rd1!' })
  newPassword: string;
}

/**
 * Google OAuth Callback DTO
 */
export class GoogleOAuthDto {
  @IsString()
  @IsNotEmpty()
    @ApiProperty({ example: 'jwt.token.string' })
  accessToken: string;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: 'jwt.token.string' })
  refreshToken?: string;

  @IsString()
  @IsNotEmpty()
    @ApiProperty({ example: 'user@example.com' })
  email: string;

  @IsString()
    @ApiProperty({ example: 'John' })
  firstName: string;

  @IsString()
    @ApiProperty({ example: 'Doe' })
  lastName: string;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: 'string' })
  profilePicture?: string;
}

/**
 * Login Response DTO
 * Returned on successful login
 */
export class AuthResponseDto {
  @ApiProperty({ example: true })
    success: boolean;
  @ApiProperty({ example: 'jwt.token.string' })
    accessToken: string;
  @ApiProperty({ example: 'jwt.token.string' })
    refreshToken: string;
  @ApiProperty({ example: false })
    user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    isVerified: boolean;
    hasActiveMonth: boolean;
    lastLogin?: Date;
    createdAt: Date;
  };
  @ApiProperty({ example: 0 })
    expiresIn: number; // seconds
}

/**
 * User Profile Response DTO
 */
export class UserProfileDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;
  @ApiProperty({ example: 'user@example.com' })
    email: string;
  @ApiProperty({ example: 'John' })
    firstName: string;
  @ApiProperty({ example: 'Doe' })
    lastName: string;
  @ApiPropertyOptional({ example: 'string' })
    profilePicture?: string;
  @ApiProperty({ example: true })
    isVerified: boolean;
  @ApiProperty({ example: false })
    hasActiveMonth: boolean;
  @ApiProperty({ example: '2026-04-10T10:00:00Z' })
    lastLogin: Date;
  @ApiProperty({ example: '2026-04-10T10:00:00Z' })
    createdAt: Date;
}
