import { Module } from '@nestjs/common';
import { DatabaseService } from '../../common/services/database.service.js';
import { AuditService } from '../audit/audit.service.js';
import { TelegramService } from '../../common/services/telegram.service.js';
import { LeadsController } from './leads.controller.js';
import { LeadsService } from './leads.service.js';
import { IngestionService } from './ingestion.service.js';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService, IngestionService, DatabaseService, AuditService, TelegramService],
  exports: [LeadsService, IngestionService, TelegramService],
})
export class LeadsModule {}
