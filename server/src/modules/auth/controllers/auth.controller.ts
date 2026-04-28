import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  VerifyEmailDto,
  UserProfileDto,
  ChangePasswordDto,
  ResetPasswordRequestDto,
  ResetPasswordDto,
} from "../dto/auth.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { User } from "../decorators/user.decorator";
import { ApiResponse } from "../../../common/dto/response.dto";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse as SwaggerApiResponse } from "@nestjs/swagger";

/**
 * Authentication Controller
 *
 * Handles:
 * - User registration (email/password)
 * - User login (email/password and Google OAuth)
 * - Email verification
 * - Token refresh
 * - Password reset
 * - Logout
 */
@Controller("auth")
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Auth API Info" })
  authInfo(): ApiResponse<{
    login: string;
    register: string;
    currentUser: string;
  }> {
    return ApiResponse.success({
      login: "POST /api/v1/auth/login",
      register: "POST /api/v1/auth/register",
      currentUser: "GET /api/v1/auth/me with Bearer token",
    });
  }

  @Get("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login API Info" })
  loginInfo(): ApiResponse<{ method: string; path: string }> {
    return ApiResponse.success({
      method: "POST",
      path: "/api/v1/auth/login",
    });
  }

  /**
   * POST /auth/register
   * Register a new user with email and password
   */
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async register(@Body() registerDto: RegisterDto): Promise<ApiResponse<AuthResponseDto>> {
    const data = await this.authService.register(registerDto);
    return ApiResponse.success(data);
  }

  @Get("register")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Register API Info" })
  registerInfo(): ApiResponse<{ method: string; path: string }> {
    return ApiResponse.success({
      method: "POST",
      path: "/api/v1/auth/register",
    });
  }

  /**
   * POST /auth/login
   * Login with email and password
   */
  @Post("login")
  @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<AuthResponseDto>> {
    const data = await this.authService.login(loginDto);
    return ApiResponse.success(data);
  }

  /**
   * GET /auth/google
   * Redirect to Google OAuth
   */
  @Get("google")
  @UseGuards(AuthGuard("google"))
    @ApiOperation({ summary: 'Google Auth' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  googleAuth() {
    // Guard redirects to Google
  }

  /**
   * GET /auth/google/callback
   * Google OAuth callback
   */
  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
    @ApiOperation({ summary: 'Google Auth Callback' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.handleGoogleAuth(req.user as any);

    // Redirect to frontend with tokens
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const redirectParams = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    const redirectUrl = `${frontendUrl}/auth/callback?${redirectParams.toString()}`;
    res.redirect(redirectUrl);
  }

  /**
   * POST /auth/verify-email
   * Verify user's email address
   */
  @Post("verify-email")
  @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify Email' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
  ): Promise<ApiResponse<{ success: boolean }>> {
    const data = await this.authService.verifyEmail(dto.token);
    return ApiResponse.success(data);
  }

  /**
   * POST /auth/resend-verification-email
   * Resend verification email to user
   */
  @Post("resend-verification-email")
  @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Resend Verification Email' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async resendVerificationEmail(
    @Body("email") email: string,
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    const data = await this.authService.resendVerificationEmail(email);
    return ApiResponse.success(data);
  }

  /**
   * POST /auth/refresh
   * Refresh access token using refresh token
   */
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh Token' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async refreshToken(
    @Body("refreshToken") refreshToken: string,
  ): Promise<ApiResponse<{ accessToken: string; refreshToken: string; expiresIn: number }>> {
    const data = await this.authService.refreshToken(refreshToken);
    return ApiResponse.success(data);
  }

  /**
   * GET /auth/me
   * Get current authenticated user's profile
   */
  @Get("me")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get Current User' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async getCurrentUser(@User() user: any): Promise<ApiResponse<UserProfileDto>> {
    const data = await this.authService.getUserProfile(user.id);
    return ApiResponse.success(data);
  }

  /**
   * POST /auth/change-password
   * Change password for authenticated user
   */
  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Change Password' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async changePassword(
    @User("id") userId: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    const data = await this.authService.changePassword(userId, dto);
    return ApiResponse.success(data);
  }

  /**
   * POST /auth/logout
   * Logout user (invalidate tokens)
   */
  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Logout' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async logout(@User("id") userId: string): Promise<ApiResponse<{ success: boolean }>> {
    const data = await this.authService.logout(userId);
    return ApiResponse.success(data);
  }

  /**
   * POST /auth/forgot-password
   * Request password reset link
   */
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Forgot Password' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async forgotPassword(
    @Body() dto: ResetPasswordRequestDto,
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    const data = await this.authService.forgotPassword(dto.email);
    return ApiResponse.success(data);
  }

  /**
   * POST /auth/reset-password
   * Reset password with token
   */
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reset Password' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    const data = await this.authService.resetPassword(dto.token, dto.newPassword);
    return ApiResponse.success(data);
  }

  /**
   * Health check endpoint
   */
  @Get("health")
  @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Health' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  health(): ApiResponse<{ status: string }> {
    return ApiResponse.success({ status: "ok" });
  }
}
