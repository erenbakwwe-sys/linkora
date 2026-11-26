import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './public.decorator.js';
import {
  DEFAULT_TENANT_ID,
  getGitasisWebhookTokens,
  getJwtSecret,
  matchesAny,
} from '../security/secrets.js';
import { setRequestTenant } from '../services/request-context.js';

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: string;
  mode: 'MANAGER' | 'AGENT';
  type?: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector?.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers.authorization;

    // 1. Partner API key authentication (keys come from environment variables only)
    const apiKey =
      request.headers['x-api-key'] ||
      request.headers['x-api-token'] ||
      (authHeader && authHeader.startsWith('Bearer lk_') ? authHeader.split(' ')[1] : null) ||
      request.query?.apiKey ||
      request.query?.token;

    if (apiKey && matchesAny(apiKey, getGitasisWebhookTokens())) {
      // The partner key is bound to a fixed tenant; it can NOT be overridden by a request header.
      request.user = {
        sub: 'usr-api-partner',
        email: 'api-partner@linkora.io',
        tenantId: process.env.API_KEY_TENANT_ID || DEFAULT_TENANT_ID,
        role: 'API_PARTNER',
        mode: 'MANAGER',
      };
      setRequestTenant(request.user.tenantId);
      return true;
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization token');
    }

    const token = authHeader.split(' ')[1];
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync(token, { secret: getJwtSecret() });
    } catch {
      throw new UnauthorizedException('Token is invalid or expired');
    }

    // Refresh tokens must never be usable as access tokens
    if (payload.type === 'refresh' || !payload.tenantId) {
      throw new UnauthorizedException('Token is invalid or expired');
    }

    request.user = payload;
    setRequestTenant(payload.tenantId);
    return true;
  }
}
