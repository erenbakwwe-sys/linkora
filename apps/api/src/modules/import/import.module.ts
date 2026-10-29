import { Module } from '@nestjs/common';
import { DatabaseService } from '../../common/services/database.service.js';
import { AuditService } from '../audit/audit.service.js';
import { LeadsModule } from '../leads/leads.module.js';
import { ImportController } from './import.controller.js';
import { ImportService } from './import.service.js';

@Module({
  imports: [LeadsModule],
  controllers: [ImportController],
  providers: [ImportService, DatabaseService, AuditService],
  exports: [ImportService],
})
export class ImportModule {}
