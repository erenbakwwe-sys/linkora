import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CurrentTenant } from '../../common/guards/user.decorator.js';
import { ReportsService } from './reports.service.js';

@ApiTags('Berichte, Statistiken & Scorecards')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('user-stats')
  @ApiOperation({ summary: 'Get user statistics and conversion metrics' })
  async getUserStats(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.reportsService.getUserStats(tId);
  }

  @Get('talk-time')
  @ApiOperation({ summary: 'Get talk/wrap/pause time report with agent scorecard' })
  async getTalkTimeReport(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.reportsService.getTalkTimeReport(tId);
  }
}
