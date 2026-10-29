import { Module } from '@nestjs/common';
import { DatabaseService } from '../../common/services/database.service.js';
import { AuditService } from '../audit/audit.service.js';
import { LeadsController } from './leads.controller.js';
import { LeadsService } from './leads.service.js';
import { IngestionService } from './ingestion.service.js';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService, IngestionService, DatabaseService, AuditService],
  exports: [LeadsService, IngestionService],
})
export class LeadsModule {}
