import { Controller, Get, Query, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';

@Controller('v1/dashboard')
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

  @Get('leaderboard')
  getLeaderboard(@Req() req: any) {
    return this.dashboardService.getLeaderboard(req.user.tenantId, req.user.sub);
  }
}
