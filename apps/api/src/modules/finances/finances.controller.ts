import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CurrentTenant } from '../../common/guards/user.decorator.js';
import { FinancesService } from './finances.service.js';

@ApiTags('Finanzen, Kasa, Guthaben & CDR')
@Controller('finances')
export class FinancesController {
  constructor(private readonly financesService: FinancesService) {}

  @Get('kasa')
  @ApiOperation({ summary: 'Get Kasa income, fällig and nächster Monat totals' })
  async getKasaIncome(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.financesService.getKasaIncome(tId);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance, credit limit, and minute costs' })
  async getBalanceCosts(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.financesService.getBalanceCosts(tId);
  }

  @Get('bank-info')
  @ApiOperation({ summary: 'Get bank details for wire transfer (Ziraat Bankası / Taha Eren Bal)' })
  async getBankInfo() {
    return this.financesService.getBankInfo();
  }

  @Get('topup-requests')
  @ApiOperation({ summary: 'List all bank transfer topup requests' })
  async getTopupRequests(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.financesService.getTopupRequests(tId);
  }

  @Post('topup-requests')
  @ApiOperation({ summary: 'Submit a new bank transfer payment notice (Havale Bildirimi)' })
  async createTopupRequest(
    @Body() body: { amountEur: number; senderName: string; notes?: string; referenceCode?: string },
    @CurrentTenant() tenantId?: string
  ) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.financesService.createTopupRequest(tId, body);
  }

  @Post('topup-requests/:id/approve')
  @ApiOperation({ summary: 'Admin approves topup request and credits the wallet balance' })
  async approveTopupRequest(
    @Param('id') id: string,
    @Body('approvedBy') approvedBy?: string,
    @CurrentTenant() tenantId?: string
  ) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.financesService.approveTopupRequest(tId, id, approvedBy || 'Taha Eren Bal');
  }

  @Post('topup-requests/:id/reject')
  @ApiOperation({ summary: 'Admin rejects topup request' })
  async rejectTopupRequest(
    @Param('id') id: string,
    @CurrentTenant() tenantId?: string
  ) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.financesService.rejectTopupRequest(tId, id);
  }

  @Post('topup')
  @ApiOperation({ summary: 'Top up wallet balance' })
  async topUpWallet(@Body('amount') amount: number, @CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.financesService.topUpWallet(tId, amount || 100);
  }

  @Get('cdr')
  @ApiOperation({ summary: 'Get Call Detail Records (CDR) table' })
  async getCdrList(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.financesService.getCdrList(tId);
  }
}
