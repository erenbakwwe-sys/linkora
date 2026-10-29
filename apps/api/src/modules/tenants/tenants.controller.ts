import { Controller, Get, Put, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service.js';
import { CurrentTenant } from '../../common/guards/user.decorator.js';

@Controller('tenants')
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Get('sub-companies')
  getSubCompanies() {
    return this.tenantsService.getSubCompanies();
  }

  @Post('sub-companies')
  createSubCompany(
    @Body()
    body: {
      name: string;
      revenueSharePercent?: number;
      adminUsername: string;
      password?: string;
    }
  ) {
    return this.tenantsService.createSubCompany(body);
  }

  @Put('sub-companies/:id')
  updateSubCompany(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      revenueSharePercent?: number;
      adminUsername?: string;
      status?: 'Aktiv' | 'Deaktiviert';
    }
  ) {
    return this.tenantsService.updateSubCompany(id, body);
  }

  @Delete('sub-companies/:id')
  deleteSubCompany(@Param('id') id: string) {
    return { success: this.tenantsService.deleteSubCompany(id) };
  }

  @Get('accessible')
  async getAccessible(@Req() req: any, @CurrentTenant() tenantId?: string) {
    const tId = tenantId || req?.user?.tenantId || '11111111-1111-1111-1111-111111111111';
    return this.tenantsService.getAccessibleTenants(tId);
  }

  @Put('branding')
  async updateBranding(
    @Req() req: any,
    @Body() body: { brand_name: string; primary_color: string; logo_url: string | null },
    @CurrentTenant() tenantId?: string
  ) {
    const tId = tenantId || req?.user?.tenantId || '11111111-1111-1111-1111-111111111111';
    return this.tenantsService.updateBranding(tId, body);
  }

  @Post('provision-subcompany')
  async provisionSubCompany(
    @Body() body: any,
    @CurrentTenant() tenantId?: string
  ) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.tenantsService.provisionSubCompany(tId, body);
  }
}
