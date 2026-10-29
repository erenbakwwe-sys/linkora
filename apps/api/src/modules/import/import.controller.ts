import { Controller, Post, Get, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CurrentTenant, CurrentUser } from '../../common/guards/user.decorator.js';
import { ImportService } from './import.service.js';
import { IngestionService } from '../leads/ingestion.service.js';
import { importExecuteSchema, ImportExecuteInput } from '@linkora/shared';

@ApiTags('Excel & Import Center')
@Controller('import')
export class ImportController {
  constructor(
    private readonly importService: ImportService,
    private readonly ingestionService: IngestionService,
  ) {}

  @Post('preview')
  @ApiOperation({ summary: 'Parse CSV content, extract headers and suggest field mapping' })
  async previewCsv(@Body('csvContent') csvContent: string) {
    if (!csvContent) {
      throw new BadRequestException('Feld "csvContent" ist erforderlich.');
    }
    return this.importService.previewCsv(csvContent);
  }

  @Post('execute')
  @ApiOperation({ summary: 'Execute mapped CSV import with batch idempotency and quarantine routing' })
  async executeImport(
    @Body() body: any,
    @CurrentTenant() tenantId?: string,
    @CurrentUser() user?: any,
  ) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    const parseRes = importExecuteSchema.safeParse(body);
    if (!parseRes.success) {
      throw new BadRequestException(parseRes.error.errors.map((e) => e.message).join(', '));
    }

    return this.importService.executeImport(tId, parseRes.data, user?.id);
  }

  @Get('quarantine')
  @ApiOperation({ summary: 'List all quarantined import rows pending review' })
  async getQuarantine(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.ingestionService.getQuarantineRecords(tId);
  }

  @Post('quarantine/:id/reprocess')
  @ApiOperation({ summary: 'Reprocess and validate a corrected quarantine record' })
  async reprocessQuarantine(
    @Param('id') id: string,
    @Body() correctedData: any,
    @CurrentTenant() tenantId?: string,
  ) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.importService.reprocessQuarantine(tId, id, correctedData);
  }
}
