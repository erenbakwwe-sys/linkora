import { Module } from '@nestjs/common';
import { DatabaseService } from '../../common/services/database.service.js';
import { CallbacksController } from './callbacks.controller.js';
import { CallbacksService } from './callbacks.service.js';

@Module({
  controllers: [CallbacksController],
  providers: [CallbacksService, DatabaseService],
  exports: [CallbacksService],
})
export class CallbacksModule {}
