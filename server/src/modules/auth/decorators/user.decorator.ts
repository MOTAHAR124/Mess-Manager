import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * User Decorator
 *
 * Extracts the authenticated user from the request
 * Populated by JwtAuthGuard
 *
 * Usage:
 * @Get('/profile')
 * getProfile(@User() user: UserEntity) {
 *   return user;
 * }
 */
export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If data is specified, return that specific property
    // e.g., @User('id') userId: string
    return data ? user?.[data] : user;
  },
);
