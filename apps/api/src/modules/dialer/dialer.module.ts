import { Module } from '@nestjs/common';
import { DatabaseService } from '../../common/services/database.service.js';
import { AuditService } from '../audit/audit.service.js';
import { LeadsModule } from '../leads/leads.module.js';
import { LiveGateway } from '../gateway/live.gateway.js';
import {
  DialerController,
  CampaignsController,
  AutoDialController,
  RecordingsController,
} from './dialer.controller.js';
import { DialerService } from './dialer.service.js';
import { AgentStateService } from './agent-state.service.js';
import { CampaignsService } from './campaigns.service.js';
import { AutoDialService } from './auto-dial.service.js';
import { RecordingsService } from './recordings.service.js';

@Module({
  imports: [LeadsModule],
  controllers: [
    DialerController,
    CampaignsController,
    AutoDialController,
    RecordingsController,
  ],
  providers: [
    DatabaseService,
    AuditService,
    LiveGateway,
    DialerService,
    AgentStateService,
    CampaignsService,
    AutoDialService,
    RecordingsService,
  ],
  exports: [
    DialerService,
    AgentStateService,
    CampaignsService,
    AutoDialService,
    RecordingsService,
  ],
})
export class DialerModule {}
