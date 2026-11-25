import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service.js';
import { CurrentTenant } from '../../common/guards/user.decorator.js';
import { Roles, RolesGuard } from '../../common/guards/roles.guard.js';

@Controller('tenants')
@UseGuards(RolesGuard)
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Get('sub-companies')
  getSubCompanies() {
    return this.tenantsService.getSubCompanies();
  }

  @Post('sub-companies')
  @Roles('COMPANY_ADMIN', 'SUPER_ADMIN')
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
  @Roles('COMPANY_ADMIN', 'SUPER_ADMIN')
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
  @Roles('COMPANY_ADMIN', 'SUPER_ADMIN')
  deleteSubCompany(@Param('id') id: string) {
    return { success: this.tenantsService.deleteSubCompany(id) };
  }

  @Get('accessible')
  async getAccessible(@CurrentTenant() tenantId: string) {
    return this.tenantsService.getAccessibleTenants(tenantId);
  }

  @Put('branding')
  @Roles('COMPANY_ADMIN', 'SUPER_ADMIN')
  async updateBranding(
    @Body() body: { brand_name: string; primary_color: string; logo_url: string | null },
    @CurrentTenant() tenantId: string
  ) {
    return this.tenantsService.updateBranding(tenantId, body);
  }

  @Post('provision-subcompany')
  @Roles('COMPANY_ADMIN', 'SUPER_ADMIN')
  async provisionSubCompany(
    @Body() body: any,
    @CurrentTenant() tenantId: string
  ) {
    return this.tenantsService.provisionSubCompany(tenantId, body);
  }
}
