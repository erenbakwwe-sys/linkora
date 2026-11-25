import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard.js';
import { IS_PUBLIC_KEY } from '../src/common/guards/public.decorator.js';
import { getJwtSecret } from '../src/common/security/secrets.js';

function makeContext(request: any, isPublic = false) {
  const handler = () => undefined;
  if (isPublic) Reflect.defineMetadata(IS_PUBLIC_KEY, true, handler);
  return {
    getHandler: () => handler,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as any;
}

describe('JwtAuthGuard (global authentication)', () => {
  const jwt = new JwtService({ secret: getJwtSecret() });
  const guard = new JwtAuthGuard(jwt, new Reflector());

  afterEach(() => {
    delete process.env.LINKORA_LIVE_API_KEY;
  });

  it('allows @Public() routes without credentials', async () => {
    await expect(guard.canActivate(makeContext({ headers: {}, query: {} }, true))).resolves.toBe(true);
  });

  it('rejects requests without a token', async () => {
    await expect(guard.canActivate(makeContext({ headers: {}, query: {} }))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('accepts a valid access token', async () => {
    const token = await jwt.signAsync({ sub: 'u1', tenantId: 't1', role: 'AGENT', mode: 'AGENT' });
    const req: any = { headers: { authorization: `Bearer ${token}` }, query: {} };
    await expect(guard.canActivate(makeContext(req))).resolves.toBe(true);
    expect(req.user.tenantId).toBe('t1');
  });

  it('rejects refresh tokens used as access tokens', async () => {
    const token = await jwt.signAsync({ sub: 'u1', tenantId: 't1', type: 'refresh' });
    const req: any = { headers: { authorization: `Bearer ${token}` }, query: {} };
    await expect(guard.canActivate(makeContext(req))).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects the formerly hardcoded API keys when they are not configured', async () => {
    const req: any = { headers: { 'x-api-key': 'gitasis_linkora_2026' }, query: {} };
    await expect(guard.canActivate(makeContext(req))).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('accepts a configured partner API key and ignores X-Tenant-Id spoofing', async () => {
    process.env.LINKORA_LIVE_API_KEY = 'lk_live_configured_for_test_only';
    const req: any = {
      headers: { 'x-api-key': 'lk_live_configured_for_test_only', 'x-tenant-id': 'attacker-tenant' },
      query: {},
    };
    await expect(guard.canActivate(makeContext(req))).resolves.toBe(true);
    expect(req.user.tenantId).not.toBe('attacker-tenant');
  });
});
