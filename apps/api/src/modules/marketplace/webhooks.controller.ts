import { Controller, Get, Post, Body, Query, Headers, Req, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service.js';
import { Public } from '../../common/guards/public.decorator.js';
import { getGitasisWebhookTokens, matchesAny } from '../../common/security/secrets.js';

@ApiTags('Inbound Webhooks')
@Public() // inbound webhooks authenticate via token (Gitasis) or HMAC signature (VIP Call)
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
    return this.marketplaceService.processGitasisWebhook(body, queryToken, headerToken, { requireToken: true });
  }

  @Get('gitasis')
  @ApiOperation({ summary: 'Gitasis Webhook Health Check and URL Verification' })
  async verifyGitasisWebhook(@Query('token') token?: string) {
    return {
      status: 'active',
      service: 'Linkora Gitasis Webhook Receiver',
      method: 'POST',
      acceptedFormats: ['application/json', 'application/x-www-form-urlencoded'],
      tokenValid: matchesAny(token, getGitasisWebhookTokens()),
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
@Public() // authenticated via X-LK-Signature HMAC
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
