import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  UserProfileDto,
  ChangePasswordDto,
} from "../dto/auth.dto";
import { PrismaService } from "../../../common/prisma/prisma.service";

/**
 * Authentication Service
 *
 * Handles all authentication business logic:
 * - User registration and email verification
 * - Login with email/password
 * - Google OAuth handling
 * - JWT token generation and validation
 * - Password management
 */
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        passwordHash,
        isVerified: false,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken, expiresIn } = await this.generateTokens(
      user.id,
      email,
    );

    return {
      success: true,
      accessToken,
      refreshToken,
      user: await this.buildAuthUser(user.id),
      expiresIn,
    };
  }

  /**
   * Login with email and password
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate tokens
    const { accessToken, refreshToken, expiresIn } = await this.generateTokens(
      user.id,
      user.email,
    );

    return {
      success: true,
      accessToken,
      refreshToken,
      user: await this.buildAuthUser(user.id),
      expiresIn,
    };
  }

  /**
   * Handle Google OAuth callback
   */
  async handleGoogleAuth(profile: any): Promise<AuthResponseDto> {
    const email = profile.emails?.[0]?.value || profile.email;

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new user for Google OAuth
      user = await this.prisma.user.create({
        data: {
          email,
          firstName: profile.name?.givenName || profile.firstName || "User",
          lastName: profile.name?.familyName || profile.lastName || "",
          googleId: profile.id,
          googleProfile: profile._json || profile,
          isVerified: true, // OAuth emails are verified
        },
      });
    } else if (!user.googleId) {
      // Link Google account if user exists but hasn't used Google
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: profile.id,
          googleProfile: profile._json || profile,
          isVerified: true,
        },
      });
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate tokens
    const { accessToken, refreshToken, expiresIn } = await this.generateTokens(
      user.id,
      user.email,
    );

    return {
      success: true,
      accessToken,
      refreshToken,
      user: await this.buildAuthUser(user.id),
      expiresIn,
    };
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<{ success: boolean }> {
    try {
      const decoded = this.jwtService.verify(token);

      if (decoded.type !== "email_verification") {
        throw new BadRequestException("Invalid token type");
      }

      await this.prisma.user.update({
        where: { email: decoded.email },
        data: { isVerified: true },
      });

      return { success: true };
    } catch (error) {
      throw new BadRequestException("Invalid or expired token");
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    if (user.isVerified) {
      throw new BadRequestException("Email already verified");
    }

    // TODO: Actually send the email here using an EmailService

    return {
      success: true,
      message: "Verification email sent",
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshTokenString: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      const decoded = this.jwtService.verify(refreshTokenString, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      // Rotation: Generate a new token pair
      return this.generateTokens(decoded.userId, decoded.email);
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfileDto> {
    return this.buildAuthUser(userId);
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new BadRequestException("User not found");
    }

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid current password");
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return {
      success: true,
      message: "Password changed successfully",
    };
  }

  /**
   * Logout user
   */
  async logout(_userId: string): Promise<{ success: boolean }> {
    // In a stateless JWT system, logout is mostly frontend-side
    // Optionally, blacklist the token in Redis here
    return { success: true };
  }

  /**
   * Forgot password request
   */
  async forgotPassword(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't leak user existence
      return {
        success: true,
        message: "If this email exists, a reset link has been sent",
      };
    }

    // TODO: Send password reset email
    return {
      success: true,
      message: "Password reset link sent",
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const decoded = this.jwtService.verify(token);

      if (decoded.type !== "password_reset") {
        throw new BadRequestException("Invalid token type");
      }

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new BadRequestException("User not found");
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });

      return {
        success: true,
        message: "Password reset successfully",
      };
    } catch (error) {
      throw new BadRequestException("Invalid or expired reset token");
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const accessToken = this.jwtService.sign(
      { userId, email },
      { expiresIn: (process.env.JWT_EXPIRATION as any) || "15m" },
    );

    const refreshToken = this.jwtService.sign(
      { userId, email, type: "refresh" },
      {
        expiresIn: (process.env.JWT_REFRESH_EXPIRATION as any) || "7d",
        secret: process.env.JWT_REFRESH_SECRET,
      },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  private async buildAuthUser(userId: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        messMembers: {
          where: {
            status: "ACTIVE",
            mess: {
              activeMonthId: {
                not: null,
              },
            },
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture || undefined,
      isVerified: user.isVerified,
      hasActiveMonth: user.messMembers.length > 0,
      lastLogin: user.lastLogin || user.createdAt,
      createdAt: user.createdAt,
    };
  }
}
