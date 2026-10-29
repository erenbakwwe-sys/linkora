import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CurrentTenant, CurrentUser } from '../../common/guards/user.decorator.js';
import { OperationsService } from './operations.service.js';

@ApiTags('Operations, HR-Zeit, Rota & Collaboration')
@Controller('operations')
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  // --- Shifts / Rota ---
  @Get('shifts')
  @ApiOperation({ summary: 'Get shift schedule (Rota-Tafel) with conflict highlighting' })
  async getShifts(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.operationsService.getShifts(tId);
  }

  @Post('shifts')
  @ApiOperation({ summary: 'Create shift with automatic leave conflict check' })
  async createShift(@Body() body: any, @CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.operationsService.createShift({
      tenantId: tId,
      teamName: body.teamName || 'Outbound Team',
      userId: body.userId,
      userName: body.userName || 'Mitarbeiter',
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
    });
  }

  // --- HR-Zeit Tracking ---
  @Get('hr-time')
  @ApiOperation({ summary: 'Get HR time entries and daily/weekly totals' })
  async getTimeEntries(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.operationsService.getTimeEntries(tId);
  }

  @Post('hr-time/clock-in')
  @ApiOperation({ summary: 'Clock in employee' })
  async clockIn(@Body('userId') userId: string, @Body('userName') userName: string, @CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.operationsService.clockIn(tId, userId || 'agent-default', userName || 'Agent');
  }

  @Post('hr-time/clock-out')
  @ApiOperation({ summary: 'Clock out employee with break duration' })
  async clockOut(@Body('userId') userId: string, @Body('breakMinutes') breakMinutes: number, @CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.operationsService.clockOut(tId, userId || 'agent-default', breakMinutes);
  }

  @Post('hr-time/:id/approve')
  @ApiOperation({ summary: 'Approve time entry by manager' })
  async approveTimeEntry(@Param('id') id: string, @CurrentUser() user: any, @CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.operationsService.approveTimeEntry(tId, id, user?.name || 'Manager');
  }

  // --- Leaves / Vacation ---
  @Get('vacation')
  @ApiOperation({ summary: 'Get vacation and leave requests' })
  async getLeaves(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.operationsService.getLeaves(tId);
  }

  @Post('vacation')
  @ApiOperation({ summary: 'Submit vacation / leave request' })
  async requestLeave(@Body() body: any, @CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.operationsService.requestLeave({
      tenantId: tId,
      userId: body.userId || 'agent-default',
      userName: body.userName || 'Mitarbeiter',
      startDate: body.startDate,
      endDate: body.endDate,
      leaveType: body.leaveType || 'URLAUB',
      reason: body.reason,
    });
  }

  @Patch('vacation/:id/status')
  @ApiOperation({ summary: 'Approve or reject leave request' })
  async updateLeaveStatus(
    @Param('id') id: string,
    @Body('status') status: 'APPROVED' | 'REJECTED',
    @CurrentTenant() tenantId?: string
  ) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.operationsService.updateLeaveStatus(tId, id, status);
  }

  // --- Bonuses ---
  @Get('bonuses')
  @ApiOperation({ summary: 'Get bonus awards and achievements' })
  async getBonuses(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.operationsService.getBonusAwards(tId);
  }

  @Post('bonuses')
  @ApiOperation({ summary: 'Award performance bonus to agent' })
  async awardBonus(@Body() body: any, @CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.operationsService.awardBonus({
      tenantId: tId,
      userId: body.userId,
      userName: body.userName,
      ruleName: body.ruleName,
      amount: body.amount,
      referenceId: body.referenceId,
    });
  }

  // --- Announcements ---
  @Get('announcements')
  @ApiOperation({ summary: 'Get announcements board with pinned items' })
  async getAnnouncements(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.operationsService.getAnnouncements(tId);
  }

  @Post('announcements')
  @ApiOperation({ summary: 'Post new company announcement' })
  async createAnnouncement(@Body() body: any, @CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.operationsService.createAnnouncement({
      tenantId: tId,
      title: body.title,
      content: body.content,
      isPinned: body.isPinned ?? false,
      authorName: body.authorName || 'Geschäftsleitung',
    });
  }

  // --- Chat ---
  @Get('chat')
  @ApiOperation({ summary: 'Get chat messages for channel' })
  async getChatMessages(@Query('channelId') channelId: string, @CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.operationsService.getMessages(tId, channelId || 'general');
  }

  @Post('chat')
  @ApiOperation({ summary: 'Send chat message' })
  async sendMessage(@Body() body: any, @CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.operationsService.sendMessage({
      tenantId: tId,
      channelId: body.channelId || 'general',
      senderId: body.senderId || 'user-default',
      senderName: body.senderName || 'Mitarbeiter',
      message: body.message,
    });
  }
}
