import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { getJwtSecret } from './common/security/secrets.js';
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
import { HyperionModule } from './modules/integrations/hyperion/hyperion.module.js';

import { UsersService } from './modules/users/users.service.js';
import { UsersController } from './modules/users/users.controller.js';
import { SystemController } from './modules/system/system.controller.js';
import { BootstrapService } from './modules/system/bootstrap.service.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: getJwtSecret(),
        signOptions: { expiresIn: '15m' },
      }),
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
    HyperionModule,
  ],
  controllers: [
    AuthController,
    TenantsController,
    DashboardController,
    UsersController,
    SystemController,
  ],
  providers: [
    // Every route requires authentication unless explicitly marked with @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    DatabaseService,
    AuditService,
    AuthService,
    TenantsService,
    DashboardService,
    LiveGateway,
    UsersService,
    BootstrapService,
  ],
})
export class AppModule {}
