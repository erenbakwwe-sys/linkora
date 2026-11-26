import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

/**
 * Resolves the tenant of the authenticated principal.
 * The tenant is taken exclusively from the verified token – never from a client-supplied header,
 * otherwise any user could read/write another tenant's data by sending `X-Tenant-Id`.
 */
export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Authentication required');
    }
    return tenantId;
  },
);

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    // Expose `id` as an alias of the JWT `sub` claim for services that expect it
    return { ...user, id: user.id || user.sub };
  },
);
