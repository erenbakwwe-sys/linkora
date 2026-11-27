import { Body, Controller, Headers, Logger, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '../../common/guards/public.decorator.js';
import { PartnerInboundService } from './partner-inbound.service.js';

@ApiTags('Partner Lead-API')
@Public() // authenticated with the partner's own lk_ key (see PartnerInboundService)
@Controller(['leads', 'v1/leads'])
export class PartnerInboundController {
  private readonly logger = new Logger(PartnerInboundController.name);

  constructor(private readonly inbound: PartnerInboundService) {}

  @Post('inbound')
  @ApiOperation({ summary: 'Partner sendet einen Lead (Authorization: Bearer lk_…)' })
  async receive(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: unknown,
    @Res() res: Response,
  ) {
    const partner = this.inbound.authenticate(authorization);
    if (!partner) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    if (this.inbound.isRateLimited(partner)) {
      return res.status(429).json({ error: 'rate_limited' });
    }
    try {
      const result = await this.inbound.receive(partner, body);
      return res.status(result.status).json(result.body);
    } catch (err: any) {
      this.logger.error(`Inbound lead from ${partner.name} failed: ${err?.message || err}`);
      return res.status(500).json({ error: 'internal_error' });
    }
  }
}
