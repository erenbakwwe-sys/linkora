import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string; tenantSlug?: string }) {
    return this.authService.login(body.email, body.password, body.tenantSlug);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('switch-mode')
  async switchMode(@Req() req: any, @Body() body: { mode: 'MANAGER' | 'AGENT' }) {
    return this.authService.switchMode(req.user.sub, body.mode);
  }

  @UseGuards(JwtAuthGuard)
  @Post('switch-tenant')
  async switchTenant(@Req() req: any, @Body() body: { tenantId: string }) {
    return this.authService.switchTenant(req.user.sub, req.user.tenantId, body.tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    return this.authService.getMe(req.user.sub, req.user.tenantId);
  }
}
