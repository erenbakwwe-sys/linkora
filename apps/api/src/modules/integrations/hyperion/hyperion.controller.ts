import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentTenant, CurrentUser } from '../../../common/guards/user.decorator.js';
import { Roles, RolesGuard } from '../../../common/guards/roles.guard.js';
import { HyperionService } from './hyperion.service.js';

@ApiTags('Integrationen: Hyperion Leads Panel')
@Controller('integrations/hyperion')
@UseGuards(RolesGuard)
@Roles('COMPANY_ADMIN', 'SUPER_ADMIN', 'TEAM_LEAD', 'QC_REVIEWER')
export class HyperionController {
  constructor(private readonly hyperion: HyperionService) {}

  @Get('status')
  @ApiOperation({ summary: 'Ist die Hyperion-Anbindung konfiguriert?' })
  status() {
    return this.hyperion.getStatus();
  }

  @Get('leads/:id/preview')
  @ApiOperation({ summary: 'Prüft, ob ein Lead vollständig für Hyperion ist (ohne zu senden)' })
  preview(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.hyperion.preview(tenantId, id);
  }

  @Post('leads/:id/send')
  @ApiOperation({ summary: 'Sendet einen Treppenlift-Lead an Hyperion (POST /api/leads/inbound)' })
  send(@Param('id') id: string, @CurrentTenant() tenantId: string, @CurrentUser() user: any) {
    return this.hyperion.sendLead(tenantId, id, user?.id);
  }
}
