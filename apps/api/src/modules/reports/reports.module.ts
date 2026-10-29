import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service.js';
import { ReportsController } from './reports.controller.js';
import { DatabaseService } from '../../common/services/database.service.js';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, DatabaseService],
  exports: [ReportsService],
})
export class ReportsModule {}
