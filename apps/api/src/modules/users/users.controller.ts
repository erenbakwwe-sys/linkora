import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CurrentTenant } from '../../common/guards/user.decorator.js';
import { Roles, RolesGuard } from '../../common/guards/roles.guard.js';

type UserRole = 'Firmen-Admin' | 'Teamleiter' | 'Agent' | 'QC-Prüfer';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getAllUsers(@CurrentTenant() tenantId: string) {
    return this.usersService.getAllUsers(tenantId);
  }

  @Get('free-numbers')
  getFreeNumbers() {
    return this.usersService.getFreeSystemNumbers();
  }

  @Put(':id')
  @Roles('COMPANY_ADMIN', 'SUPER_ADMIN')
  async updateUser(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body()
    body: {
      username?: string;
      name?: string;
      role?: UserRole;
      team?: string;
      isActive?: boolean;
      callerIdNumber?: string | null;
      newPassword?: string;
    }
  ) {
    return this.usersService.updateUser(tenantId, id, body || {});
  }

  @Post()
  @Roles('COMPANY_ADMIN', 'SUPER_ADMIN')
  async createUser(
    @CurrentTenant() tenantId: string,
    @Body()
    body: {
      username: string;
      email: string;
      role: UserRole;
      team?: string;
      callerIdNumber?: string | null;
      password?: string;
    }
  ) {
    return this.usersService.createUser(tenantId, body);
  }

  @Post(':id/toggle-status')
  @Roles('COMPANY_ADMIN', 'SUPER_ADMIN')
  async toggleStatus(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.usersService.toggleStatus(tenantId, id);
  }
}
