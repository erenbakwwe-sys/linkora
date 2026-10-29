import { Module } from '@nestjs/common';
import { OperationsService } from './operations.service.js';
import { OperationsController } from './operations.controller.js';
import { DatabaseService } from '../../common/services/database.service.js';

@Module({
  controllers: [OperationsController],
  providers: [OperationsService, DatabaseService],
  exports: [OperationsService],
})
export class OperationsModule {}
