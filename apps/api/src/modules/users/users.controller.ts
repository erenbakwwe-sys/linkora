import { Controller, Get, Post, Put, Body, Param, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CurrentTenant } from '../../common/guards/user.decorator.js';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getAllUsers(@Req() req: any, @CurrentTenant() tenantId?: string) {
    const tId = tenantId || req?.user?.tenantId;
    return this.usersService.getAllUsers(tId);
  }

  @Get('free-numbers')
  getFreeNumbers() {
    return this.usersService.getFreeSystemNumbers();
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body()
    body: {
      username?: string;
      name?: string;
      role?: 'Firmen-Admin' | 'Teamleiter' | 'Agent' | 'QC-Prüfer';
      team?: string;
      isActive?: boolean;
      callerIdNumber?: string | null;
      newPassword?: string;
    }
  ) {
    return this.usersService.updateUser(id, body);
  }

  @Post()
  async createUser(
    @Body()
    body: {
      username: string;
      email: string;
      role: 'Firmen-Admin' | 'Teamleiter' | 'Agent' | 'QC-Prüfer';
      team?: string;
      callerIdNumber?: string | null;
      password?: string;
    }
  ) {
    return this.usersService.createUser(body);
  }

  @Post(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    return this.usersService.toggleStatus(id);
  }
}
