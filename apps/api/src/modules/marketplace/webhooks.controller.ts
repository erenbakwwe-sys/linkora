import { Controller, Get, Post, Body, Query, Headers } from '@nestjs/common';
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
    return {
      status: 'active',
      service: 'Linkora Gitasis Webhook Receiver',
      method: 'POST',
      acceptedFormats: ['application/json', 'application/x-www-form-urlencoded'],
      tokenValid: token === (process.env.GITASIS_WEBHOOK_SECRET || 'gitasis_linkora_2026'),
      documentation: 'Send POST requests with customer data and call disposition (Randevu, Satış, Olumsuz, etc.)',
      timestamp: new Date().toISOString(),
    };
  }
}
