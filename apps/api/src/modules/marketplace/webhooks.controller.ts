import { Controller, Get, Post, Body, Query, Headers, Req, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service.js';

@ApiTags('Inbound Webhooks')
@Controller(['webhooks', 'v1/webhooks'])
export class WebhooksController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Post('gitasis')
  @ApiOperation({ summary: 'Gitasis (gitasis.com) Inbound Webhook for Appointments, Won, and Rejected Leads' })
  async handleGitasisWebhook(
    @Body() body: any,
    @Query('token') queryToken?: string,
    @Headers('X-API-KEY') headerToken?: string
  ) {
    return this.marketplaceService.processGitasisWebhook(body, queryToken, headerToken);
  }

  @Get('gitasis')
  @ApiOperation({ summary: 'Gitasis Webhook Health Check and URL Verification' })
  async verifyGitasisWebhook(@Query('token') token?: string) {
    const validTokens = [
      process.env.LINKORA_LIVE_API_KEY,
      process.env.VIPCALL_API_KEY,
      'lk_live_96bbc64bf9ab7c3d75a098a3b75e290968779c1b',
      process.env.LINKORA_TEST_API_KEY,
      process.env.GITASIS_WEBHOOK_SECRET,
      'lk_test_7c18f17ba37eb06e1ead5a581f0098795eb979d3',
      'gitasis_linkora_2026',
    ].filter(Boolean);

    return {
      status: 'active',
      service: 'Linkora Gitasis Webhook Receiver',
      method: 'POST',
      acceptedFormats: ['application/json', 'application/x-www-form-urlencoded'],
      tokenValid: !token || validTokens.includes(token),
      activeApiKey: 'lk_test_7c18f17ba37eb06e1ead5a581f0098795eb979d3',
      documentation: 'Send POST requests with customer data and call disposition (Randevu, Satış, Olumsuz, etc.)',
      timestamp: new Date().toISOString(),
    };
  }

  @Post(['vipcall', 'vipcall/webhook'])
  @HttpCode(200)
  @ApiOperation({ summary: 'VIP Call Dialer (vipcalldailer.com) Inbound Webhook for status, ping, and QC updates' })
  async handleVipCallWebhook(
    @Body() body: any,
    @Headers('x-lk-signature') signature?: string,
    @Headers('x-lk-delivery') deliveryId?: string,
    @Req() req?: any
  ) {
    const rawBody = req?.rawBody || JSON.stringify(body);
    return this.marketplaceService.processVipCallWebhook(body, signature, rawBody, deliveryId);
  }

  @Get(['vipcall', 'vipcall/webhook'])
  @ApiOperation({ summary: 'VIP Call Webhook Health Check & Verification' })
  async verifyVipCallWebhook() {
    return this.marketplaceService.getVipCallWebhookHealth();
  }
}

@ApiTags('Inbound Webhooks')
@Controller('vipcall')
export class VipCallWebhookController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'VIP Call /vipcall/webhook Direct Inbound Endpoint' })
  async handleDirectWebhook(
    @Body() body: any,
    @Headers('x-lk-signature') signature?: string,
    @Headers('x-lk-delivery') deliveryId?: string,
    @Req() req?: any
  ) {
    const rawBody = req?.rawBody || JSON.stringify(body);
    return this.marketplaceService.processVipCallWebhook(body, signature, rawBody, deliveryId);
  }

  @Get('webhook')
  @ApiOperation({ summary: 'VIP Call /vipcall/webhook Health Check' })
  async verifyDirectWebhook() {
    return this.marketplaceService.getVipCallWebhookHealth();
  }
}
