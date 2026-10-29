import { Module } from '@nestjs/common';
import { DatabaseService } from '../../common/services/database.service.js';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, DatabaseService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
