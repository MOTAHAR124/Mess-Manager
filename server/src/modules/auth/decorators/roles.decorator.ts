import { SetMetadata } from "@nestjs/common";

/**
 * Roles Decorator
 *
 * Usage:
 * @Roles('manager', 'admin')
 * @UseGuards(JwtAuthGuard, RoleGuard)
 * @Post('/invite-member')
 * inviteMember() { ... }
 *
 * Only users with 'manager' or 'admin' role can access
 */
export const Roles = (...roles: string[]) => SetMetadata("roles", roles);
