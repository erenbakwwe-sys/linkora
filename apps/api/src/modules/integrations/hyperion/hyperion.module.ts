import { Module } from '@nestjs/common';
import { DatabaseService } from '../../../common/services/database.service.js';
import { LeadsModule } from '../../leads/leads.module.js';
import { HyperionController } from './hyperion.controller.js';
import { HyperionService } from './hyperion.service.js';

@Module({
  imports: [LeadsModule],
  controllers: [HyperionController],
  providers: [HyperionService, DatabaseService],
})
export class HyperionModule {}
