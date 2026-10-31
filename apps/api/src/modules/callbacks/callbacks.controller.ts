import { Controller, Get, Post, Patch, Body, Param, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CurrentTenant } from '../../common/guards/user.decorator.js';
import { CallbacksService } from './callbacks.service.js';
import { callbackCreateSchema, CallbackCreateInput } from '@linkora/shared';

@ApiTags('Rückrufe (Callbacks)')
@Controller(['callbacks', 'v1/callbacks'])
export class CallbacksController {
  constructor(private readonly callbacksService: CallbacksService) {}

  @Get()
  @ApiOperation({ summary: 'List due and overdue timezone-aware callbacks' })
  async listCallbacks(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.callbacksService.listCallbacks(tId);
  }

  @Post()
  @ApiOperation({ summary: 'Schedule a new callback for a lead' })
  async createCallback(@Body() body: any, @CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    const parseRes = callbackCreateSchema.safeParse(body);
    if (!parseRes.success) {
      throw new BadRequestException(parseRes.error.errors.map((e) => e.message).join(', '));
    }
    return this.callbacksService.createCallback(tId, parseRes.data);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark a callback as completed' })
  async completeCallback(@Param('id') id: string, @CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.callbacksService.completeCallback(tId, id);
  }
}
