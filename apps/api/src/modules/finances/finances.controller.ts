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
