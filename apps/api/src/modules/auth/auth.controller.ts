import { Controller, Post, Get, Body, Req, BadRequestException } from '@nestjs/common';
import { runAsSystem } from '../../common/services/request-context.js';
import { AuthService } from './auth.service.js';
import { Public } from '../../common/guards/public.decorator.js';

@Controller(['v1/auth', 'auth'])
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: { email?: string; username?: string; identifier?: string; password: string; tenantSlug?: string }) {
    const id = body.email || body.username || body.identifier || '';
    // The user's tenant is not known yet: look the account up across tenants
    return runAsSystem(() => this.authService.login(id, body.password, body.tenantSlug));
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return runAsSystem(() => this.authService.refreshToken(body?.refreshToken));
  }

  @Post('switch-mode')
  async switchMode(@Req() req: any, @Body() body: { mode: 'MANAGER' | 'AGENT' }) {
    if (body?.mode !== 'MANAGER' && body?.mode !== 'AGENT') {
      throw new BadRequestException('mode must be MANAGER or AGENT');
    }
    return this.authService.switchMode(req.user.sub, body.mode, req.user.role, req.user.tenantId);
  }

  @Post('switch-tenant')
  async switchTenant(@Req() req: any, @Body() body: { tenantId: string }) {
    if (!body?.tenantId || typeof body.tenantId !== 'string') {
      throw new BadRequestException('tenantId is required');
    }
    return this.authService.switchTenant(req.user.sub, req.user.tenantId, body.tenantId, req.user.role);
  }

  @Get('me')
  async getMe(@Req() req: any) {
    return this.authService.getMe(req.user.sub, req.user.tenantId);
  }
}
