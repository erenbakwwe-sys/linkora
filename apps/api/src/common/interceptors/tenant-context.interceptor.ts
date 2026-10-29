import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user) {
      // If user provided X-Tenant-Id and has permission to switch (e.g. SuperAdmin or viewing sub-companies)
      const requestedTenant = request.headers['x-tenant-id'];
      if (requestedTenant && typeof requestedTenant === 'string') {
        request.activeTenantId = requestedTenant;
      } else {
        request.activeTenantId = user.tenantId;
      }
    }

    return next.handle();
  }
}
