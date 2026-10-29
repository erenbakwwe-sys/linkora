import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@Controller('v1/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@Req() req: any) {
    return this.dashboardService.getStats(req.user.tenantId);
  }

  @Get('agents')
  async getActiveAgents(@Req() req: any, @Query('company') companyFilter?: string) {
    return this.dashboardService.getActiveAgents(req.user.tenantId, companyFilter);
  }
}
