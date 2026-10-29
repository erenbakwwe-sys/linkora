import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from './common/services/database.service.js';
import { AuditService } from './modules/audit/audit.service.js';
import { AuthService } from './modules/auth/auth.service.js';
import { AuthController } from './modules/auth/auth.controller.js';
import { TenantsService } from './modules/tenants/tenants.service.js';
import { TenantsController } from './modules/tenants/tenants.controller.js';
import { DashboardService } from './modules/dashboard/dashboard.service.js';
import { DashboardController } from './modules/dashboard/dashboard.controller.js';
import { LiveGateway } from './modules/gateway/live.gateway.js';
import { ProjectsModule } from './modules/projects/projects.module.js';
import { LeadsModule } from './modules/leads/leads.module.js';
import { ImportModule } from './modules/import/import.module.js';
import { CallbacksModule } from './modules/callbacks/callbacks.module.js';
import { DialerModule } from './modules/dialer/dialer.module.js';
import { AiModule } from './modules/ai/ai.module.js';
import { MarketplaceModule } from './modules/marketplace/marketplace.module.js';
import { OperationsModule } from './modules/operations/operations.module.js';
import { FinancesModule } from './modules/finances/finances.module.js';
import { ReportsModule } from './modules/reports/reports.module.js';

import { UsersService } from './modules/users/users.service.js';
import { UsersController } from './modules/users/users.controller.js';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'super-secret-jwt-key-minimum-32-chars-long-linkora-2026',
      signOptions: { expiresIn: '15m' },
    }),
    ProjectsModule,
    LeadsModule,
    ImportModule,
    CallbacksModule,
    DialerModule,
    AiModule,
    MarketplaceModule,
    OperationsModule,
    FinancesModule,
    ReportsModule,
  ],
  controllers: [
    AuthController,
    TenantsController,
    DashboardController,
    UsersController,
  ],
  providers: [
    DatabaseService,
    AuditService,
    AuthService,
    TenantsService,
    DashboardService,
    LiveGateway,
    UsersService,
  ],
})
export class AppModule {}
