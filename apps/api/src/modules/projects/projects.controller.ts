import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CurrentTenant } from '../../common/guards/user.decorator.js';
import { ProjectsService } from './projects.service.js';

@ApiTags('Projects & Questionnaires')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('management-data')
  @ApiOperation({ summary: 'Get full project management state matching UI' })
  getManagementData(@Query('company') company?: string) {
    return this.projectsService.getProjectManagementData(company);
  }

  @Post('add-custom-type')
  @ApiOperation({ summary: 'Add a new firmeneigenen Projekttyp' })
  addCustomType(@Body() body: { name: string }) {
    return this.projectsService.addCustomProjectType(body.name);
  }

  @Post('activate-global-types')
  @ApiOperation({ summary: 'Activate selected global project types' })
  activateGlobalTypes(@Body() body: { names: string[] }) {
    return this.projectsService.activateGlobalProjectTypes(body.names);
  }

  @Delete('types/:id')
  @ApiOperation({ summary: 'Deactivate a project type' })
  deactivateType(@Param('id') id: string) {
    return { success: this.projectsService.removeProjectType(id) };
  }

  @Post('assign-team')
  @ApiOperation({ summary: 'Assign project types to a specific team' })
  assignTeam(@Body() body: { teamName: string; projectIds: string[] }) {
    return this.projectsService.assignTeamProjectTypes(body.teamName, body.projectIds);
  }

  @Get()
  @ApiOperation({ summary: 'List all active projects for the tenant' })
  async listProjects(@CurrentTenant() tenantId?: string) {
    return this.projectsService.listProjects(tenantId || '11111111-1111-1111-1111-111111111111');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project details and active questionnaire with questions' })
  async getProject(@Param('id') id: string, @CurrentTenant() tenantId?: string) {
    return this.projectsService.getProjectWithQuestionnaire(id, tenantId || '11111111-1111-1111-1111-111111111111');
  }
}
