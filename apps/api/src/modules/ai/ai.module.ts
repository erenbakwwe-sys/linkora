import { Module } from '@nestjs/common';
import { AiService } from './ai.service.js';
import { AiController } from './ai.controller.js';
import { DatabaseService } from '../../common/services/database.service.js';

@Module({
  controllers: [AiController],
  providers: [AiService, DatabaseService],
  exports: [AiService],
})
export class AiModule {}
