import { Module } from '@nestjs/common';
import { FinancesService } from './finances.service.js';
import { FinancesController } from './finances.controller.js';
import { DatabaseService } from '../../common/services/database.service.js';

@Module({
  controllers: [FinancesController],
  providers: [FinancesService, DatabaseService],
  exports: [FinancesService],
})
export class FinancesModule {}
