import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { PrismaService } from "@/common/prisma/prisma.service";

/**
 * Role-Based Access Control (RBAC) Guard with L1 Cache
 *
 * This guard checks if the authenticated user has the required roles.
 * Uses L1 in-memory cache to avoid database queries for role lookups.
 *
 * Cache Benefits:
 * - Skips database query for role check within 10 minute window
 * - Provides instant role authorization
 * - Configurable per-mess roles
 *
 * Usage:
 * @Roles('manager')
 * @UseGuards(JwtAuthGuard, RoleGuard)
 * @Post('/invite-member')
 * inviteMember() { ... }
 */
@Injectable()
export class RoleGuard implements CanActivate {
  // L1 Cache for user roles
  private l1Cache = new Map<
    string,
    {
      roles: string[];
      messId?: string;
      expiry: number;
    }
  >();

  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_CACHE_SIZE = 5000;

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {
    // Cleanup expired entries every 10 minutes
    setInterval(() => this.cleanupExpiredEntries(), 10 * 60 * 1000);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required roles from @Roles decorator
    const requiredRoles = this.reflector.get<string[]>(
      "roles",
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required, allow access
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as any;

    if (!user) {
      throw new ForbiddenException("User not found in request");
    }

    // Get mess ID from request params/body directly, or resolve it from a month ID
    let messId = request.params.messId || request.body?.messId;

    if (!messId) {
      const monthId = request.params.monthId || request.body?.monthId;
      if (monthId) {
        const month = await this.prisma.month.findUnique({
          where: { id: monthId },
          select: { messId: true },
        });
        messId = month?.messId;
      }
    }

    // Check roles (with caching)
    const hasRequiredRole = await this.hasRequiredRole(
      user.id,
      requiredRoles,
      messId,
    );

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: ${requiredRoles.join(", ")}`,
      );
    }

    return true;
  }

  /**
   * Check if user has required role(s)
   * Uses L1 cache to avoid database queries
   */
  private async hasRequiredRole(
    userId: string,
    requiredRoles: string[],
    messId?: string,
  ): Promise<boolean> {
    const cacheKey = this.createCacheKey(userId, messId);

    // Check L1 cache first
    const cachedRoles = this.getCachedRoles(cacheKey);
    if (cachedRoles) {
      return requiredRoles.some((role) => cachedRoles.includes(role));
    }

    const normalizedRequiredRoles = requiredRoles.map((role) =>
      role.toUpperCase(),
    );
    const userRoles = ["MEMBER"];

    if (userId === process.env.ADMIN_USER_ID) {
      userRoles.push("ADMIN", "MANAGER");
    }

    if (messId) {
      const membership = await this.prisma.messMember.findFirst({
        where: {
          messId,
          userId,
        },
        select: {
          role: true,
        },
      });

      if (membership?.role) {
        userRoles.push(membership.role);
      }
    }

    // Cache the roles
    this.setCachedRoles(cacheKey, userRoles, messId);

    return normalizedRequiredRoles.some((role) => userRoles.includes(role));
  }

  /**
   * Create cache key from userId and messId
   */
  private createCacheKey(userId: string, messId?: string): string {
    return messId ? `${userId}_${messId}` : userId;
  }

  /**
   * Get roles from L1 cache
   */
  private getCachedRoles(key: string): string[] | null {
    const cached = this.l1Cache.get(key);

    if (!cached) {
      return null;
    }

    if (cached.expiry < Date.now()) {
      this.l1Cache.delete(key);
      return null;
    }

    return cached.roles;
  }

  /**
   * Set roles in L1 cache
   */
  private setCachedRoles(key: string, roles: string[], messId?: string): void {
    if (this.l1Cache.size >= this.MAX_CACHE_SIZE) {
      this.l1Cache.clear();
    }

    this.l1Cache.set(key, {
      roles,
      messId,
      expiry: Date.now() + this.CACHE_TTL,
    });
  }

  /**
   * Invalidate user's role cache (call on role change)
   */
  invalidateUserRoleCache(userId: string, messId?: string): void {
    const cacheKey = this.createCacheKey(userId, messId);
    this.l1Cache.delete(cacheKey);
  }

  /**
   * Invalidate all role cache
   */
  invalidateAllCache(): void {
    this.l1Cache.clear();
  }

  /**
   * Cleanup expired entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, value] of this.l1Cache.entries()) {
      if (value.expiry < now) {
        this.l1Cache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(
        `[Role Cache Cleanup] Removed ${deletedCount} expired entries`,
      );
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.l1Cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      ttl: this.CACHE_TTL,
      utilization: `${((this.l1Cache.size / this.MAX_CACHE_SIZE) * 100).toFixed(2)}%`,
    };
  }
}
