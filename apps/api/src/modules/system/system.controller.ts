import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles, RolesGuard } from '../../common/guards/roles.guard.js';
import { DatabaseService } from '../../common/services/database.service.js';

/** Removes anything that looks like a connection string or credentials from an error message. */
function sanitize(msg: unknown): string {
  return String(msg ?? '')
    .replace(/postgres(ql)?:\/\/[^\s'"]+/gi, 'postgres://***')
    .replace(/password[^\s,;]*/gi, 'password=***')
    .slice(0, 400);
}

@ApiTags('System')
@Controller('system')
@UseGuards(RolesGuard)
@Roles('COMPANY_ADMIN', 'SUPER_ADMIN')
export class SystemController {
  constructor(private readonly db: DatabaseService) {}

  @Get('health')
  @ApiOperation({ summary: 'Datenbank-Diagnose (nur Admins, ohne Zugangsdaten)' })
  async health() {
    const url = process.env.DATABASE_URL || '';
    let host = '';
    try {
      host = url ? new URL(url).hostname.replace(/^[^.]+/, (s) => s.slice(0, 6) + '…') : '';
    } catch {
      host = 'unparseable';
    }
    const result: Record<string, any> = {
      databaseUrlConfigured: Boolean(url),
      host,
      sslmodeInUrl: /sslmode=/.test(url),
      nodeEnv: process.env.NODE_ENV || null,
    };

    try {
      const r = await this.db.query('SELECT current_database() AS db, version() AS version');
      result.connected = true;
      result.database = r.rows[0]?.db;
      result.version = String(r.rows[0]?.version || '').split(' on ')[0];
    } catch (err: any) {
      result.connected = false;
      result.connectError = sanitize(err?.message || err);
      result.connectErrorCode = err?.code || null;
      return result;
    }

    try {
      const t = await this.db.query(
        `SELECT table_schema, table_name FROM information_schema.tables
         WHERE table_schema NOT IN ('pg_catalog','information_schema') ORDER BY 1,2`,
      );
      result.tables = t.rows.map((x: any) => `${x.table_schema}.${x.table_name}`);
    } catch (err: any) {
      result.tablesError = sanitize(err?.message);
    }

    for (const table of ['tenants', 'users', 'user_roles', 'roles', 'projects', 'leads', 'wallets', 'campaigns']) {
      try {
        const c = await this.db.query(`SELECT COUNT(*)::int AS n FROM ${table}`);
        (result.counts ||= {})[table] = c.rows[0]?.n;
      } catch (err: any) {
        (result.countErrors ||= {})[table] = sanitize(err?.message);
      }
    }

    try {
      const cols = await this.db.query(
        `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='users' ORDER BY ordinal_position`,
      );
      result.usersColumns = cols.rows.map((x: any) => x.column_name);
    } catch {
      // ignore
    }
    return result;
  }
}
