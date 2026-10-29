import { Controller, Get, Post, Patch, Put, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CurrentTenant, CurrentUser } from '../../common/guards/user.decorator.js';
import { DialerService } from './dialer.service.js';
import { AgentStateService, AgentState } from './agent-state.service.js';
import { CampaignsService } from './campaigns.service.js';
import { AutoDialService } from './auto-dial.service.js';
import { RecordingsService } from './recordings.service.js';

@ApiTags('Dialer & Agent Workspace')
@Controller('dialer')
export class DialerController {
  constructor(
    private readonly dialerService: DialerService,
    private readonly agentStateService: AgentStateService,
  ) {}

  @Post('call')
  @ApiOperation({ summary: 'Initiate outbound call to lead from agent workspace' })
  async dialLead(
    @Body('leadId') leadId: string,
    @Body('callerNumber') callerNumber: string,
    @CurrentTenant() tenantId?: string,
    @CurrentUser() user?: any,
  ) {
    if (!leadId) throw new BadRequestException('leadId ist erforderlich.');
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    const agentId = user?.id || '99999999-0000-0000-0000-000000000005';
    return this.dialerService.dialLead(tId, leadId, agentId, callerNumber);
  }

  @Post('hangup')
  @ApiOperation({ summary: 'Hang up call and enter mandatory ACW' })
  async hangupCall(
    @Body('callId') callId: string,
    @CurrentTenant() tenantId?: string,
    @CurrentUser() user?: any,
  ) {
    if (!callId) throw new BadRequestException('callId ist erforderlich.');
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    const agentId = user?.id || '99999999-0000-0000-0000-000000000005';
    return this.dialerService.hangupCall(tId, callId, agentId);
  }

  @Post('wrapup')
  @ApiOperation({ summary: 'Submit mandatory ACW wrapup code and return agent to READY' })
  async submitWrapup(
    @Body() body: { callId: string; leadId: string; wrapupCode: string; notes?: string; countsAsConversion?: boolean },
    @CurrentTenant() tenantId?: string,
    @CurrentUser() user?: any,
  ) {
    if (!body.callId || !body.wrapupCode) {
      throw new BadRequestException('callId und wrapupCode sind erforderlich.');
    }
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    const agentId = user?.id || '99999999-0000-0000-0000-000000000005';
    return this.dialerService.submitWrapup(tId, body.callId, agentId, body);
  }

  @Post('agent-state')
  @ApiOperation({ summary: 'Set agent state: OFFLINE, READY, WAITING, PAUSE' })
  async setAgentState(
    @Body('state') state: AgentState,
    @Body('pauseReason') pauseReason?: string,
    @CurrentTenant() tenantId?: string,
    @CurrentUser() user?: any,
  ) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    const agentId = user?.id || '99999999-0000-0000-0000-000000000005';
    return this.agentStateService.setAgentState(tId, agentId, state, {
      pauseReason,
      agentName: user?.first_name || 'Agent',
    });
  }

  @Get('active-agents')
  @ApiOperation({ summary: 'Get active agents with duration timers and color categories' })
  async getActiveAgents(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.agentStateService.getActiveAgents(tId);
  }

  @Post('supervise')
  @ApiOperation({ summary: 'Supervisor live actions: LISTEN, WHISPER, BARGE' })
  async supervise(
    @Body('callId') callId: string,
    @Body('mode') mode: 'LISTEN' | 'WHISPER' | 'BARGE',
    @CurrentTenant() tenantId?: string,
    @CurrentUser() user?: any,
  ) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    const supervisorId = user?.id || '99999999-0000-0000-0000-000000000004';
    return this.dialerService.superviseCall(tId, callId, supervisorId, mode);
  }

  @Post('report-bad-line')
  @ApiOperation({ summary: 'Report line quality issues with attached WebRTC MOS metrics' })
  async reportBadLine(
    @Body('callId') callId: string,
    @Body('notes') notes?: string,
    @CurrentTenant() tenantId?: string,
    @CurrentUser() user?: any,
  ) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    const agentId = user?.id || '99999999-0000-0000-0000-000000000005';
    return this.dialerService.reportBadLine(tId, callId, agentId, notes);
  }
}

@ApiTags('Campaigns & Live Tempo')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get('management-data')
  @ApiOperation({ summary: 'Get management campaigns layout and team data matching UI reference' })
  async getManagementData(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.campaignsService.getManagementData(tId);
  }

  @Post('set-count')
  @ApiOperation({ summary: 'Set total number of visible campaigns' })
  async setCampaignCount(@Body('count') count: number) {
    return this.campaignsService.setCampaignCount(count);
  }

  @Get()
  @ApiOperation({ summary: 'List all campaigns with pacing calculation' })
  async listCampaigns(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.campaignsService.listCampaigns(tId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign details and current live pacing stats' })
  async getCampaign(@Param('id') id: string, @CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.campaignsService.getCampaign(tId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update management campaign details (name, active, tempo, teams)' })
  async saveManagementCampaign(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.campaignsService.saveManagementCampaign(id, body);
  }

  @Post(':id/data-package')
  @ApiOperation({ summary: 'Add a new data package to campaign' })
  async addDataPackage(
    @Param('id') id: string,
    @Body('name') name: string,
  ) {
    return this.campaignsService.addDataPackage(id, name);
  }

  @Patch(':id/tempo')
  @ApiOperation({ summary: 'Update Tempo slider (1-10) live on running campaign' })
  async updateTempo(
    @Param('id') id: string,
    @Body('tempo') tempo: number,
    @CurrentTenant() tenantId?: string,
  ) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.campaignsService.updateTempo(tId, id, tempo);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update campaign status (ACTIVE, PAUSED, STOPPED)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'ACTIVE' | 'PAUSED' | 'STOPPED',
    @CurrentTenant() tenantId?: string,
  ) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.campaignsService.updateStatus(tId, id, status);
  }
}

@ApiTags('Auto-Call Settings')
@Controller('auto-dial')
export class AutoDialController {
  constructor(private readonly autoDialService: AutoDialService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Get auto-call settings (AMD, abandon rate cap 3%, ring timeout)' })
  async getSettings(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.autoDialService.getSettings(tId);
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update auto-call settings' })
  async updateSettings(
    @Body() body: any,
    @CurrentTenant() tenantId?: string,
  ) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.autoDialService.updateSettings(tId, body);
  }
}

@ApiTags('Call Recordings')
@Controller('recordings')
export class RecordingsController {
  constructor(private readonly recordingsService: RecordingsService) {}

  @Get()
  @ApiOperation({ summary: 'List dual-channel call recordings with transcripts' })
  async listRecordings(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.recordingsService.listRecordings(tId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get recording by ID' })
  async getRecording(@Param('id') id: string, @CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.recordingsService.getRecording(tId, id);
  }
}
