import { Module } from '@nestjs/common';
import { DatabaseService } from '../../common/services/database.service.js';
import { LeadsModule } from '../leads/leads.module.js';
import { PartnerInboundController } from './partner-inbound.controller.js';
import { PartnerInboundService } from './partner-inbound.service.js';

@Module({
  imports: [LeadsModule],
  controllers: [PartnerInboundController],
  providers: [PartnerInboundService, DatabaseService],
})
export class PartnerInboundModule {}
