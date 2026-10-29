import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CurrentTenant, CurrentUser } from '../../common/guards/user.decorator.js';
import { AiService } from './ai.service.js';

@ApiTags('AI Intelligence & Scoring')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('score/:leadId')
  @ApiOperation({ summary: 'Calculate AI score for a lead with guaranteed fallback ruleset' })
  async scoreLead(
    @Param('leadId') leadId: string,
    @Body() leadDataOverride?: Record<string, any>,
    @CurrentTenant() tenantId?: string,
  ) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.aiService.scoreLead(tId, leadId, leadDataOverride);
  }

  @Get('scores/:leadId')
  @ApiOperation({ summary: 'Get score history for a lead' })
  async getScoresForLead(@Param('leadId') leadId: string) {
    return this.aiService.getScoresForLead(leadId);
  }

  @Post('analyze-call')
  @ApiOperation({ summary: 'Run conversational QC & legal compliance analysis on transcript turns' })
  async analyzeCall(@Body('turns') turns: any[]) {
    return this.aiService.analyzeCallTranscript(turns || []);
  }

  @Get('qc-queue')
  @ApiOperation({ summary: 'List low-confidence leads (<0.65) and compliance warning calls for QC reviewer' })
  async getQcQueue(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.aiService.getQcQueue(tId);
  }

  @Post('qc-review/:id')
  @ApiOperation({ summary: 'QC Review action: APPROVE, REJECT, or RE_CALL' })
  async reviewQcItem(
    @Param('id') qcId: string,
    @Body('action') action: 'APPROVE' | 'REJECT' | 'RE_CALL',
    @Body('notes') notes?: string,
    @CurrentTenant() tenantId?: string,
  ) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.aiService.reviewQcItem(tId, qcId, action, notes);
  }

  @Get('calibration-report')
  @ApiOperation({ summary: 'Conversion calibration report: Predicted vs Actual per Score Band (A, B, C, D) & Model Drift' })
  async getCalibrationReport() {
    return this.aiService.getCalibrationReport();
  }

  @Get('tr-assist/:leadId')
  @ApiOperation({ summary: 'Get tactical Turkish call brief, objection responses, and calling window' })
  async getTrBrief(@Param('leadId') leadId: string) {
    return this.aiService.getTrBrief(leadId);
  }

  @Get('tr-call-list')
  @ApiOperation({ summary: 'Get AI-prioritized call list for Turkish call center agents' })
  async getPrioritizedTrCallList() {
    return this.aiService.getPrioritizedTrCallList();
  }
}
