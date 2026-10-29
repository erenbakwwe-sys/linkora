import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return (
      request.user?.tenantId ||
      request.headers['x-tenant-id'] ||
      '11111111-1111-1111-1111-111111111111'
    );
  },
);

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return (
      request.user || {
        id: '99999999-0000-0000-0000-000000000002',
        email: 'admin@lead-kontackt.de',
        tenantId: '11111111-1111-1111-1111-111111111111',
        role: 'COMPANY_ADMIN',
        mode: 'MANAGER',
      }
    );
  },
);
