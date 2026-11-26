import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import type pg from 'pg';
import { setTenantSession, runMigrations, SCHEMA_PATCH_SQL } from '@linkora/db';
import { getDbContext } from './request-context.js';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pgModule = require('pg');
const PoolClass = pgModule.Pool || pgModule.default?.Pool;

/**
 * True when a real database is configured. In that case services must never fall back to
 * in-memory or demo data: an empty table means "no data", a failing query is an error.
 */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  public pool!: pg.Pool;

  async onModuleInit() {
    const url = process.env.DATABASE_URL || 'postgresql://linkora_user:linkora_password@localhost:5432/linkora_db';
    const isCloudDb = !url.includes('localhost') && !url.includes('127.0.0.1');
    const needsSsl = isCloudDb && (process.env.NODE_ENV === 'production' || url.includes('sslmode=') || process.env.DATABASE_SSL === 'true');

    this.pool = new PoolClass({
      connectionString: url,
      ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    if (isCloudDb || process.env.DATABASE_URL) {
      await this.ensureSchema();
    }
  }

  private async ensureSchema() {
    try {
      const res = await this.pool.query("SELECT to_regclass('public.users') as tbl;");
      if (!res.rows[0]?.tbl) {
        // Schema only – never demo data. Base records come from POST /api/system/bootstrap.
        this.logger.log('Database tables not found. Running migrations...');
        await runMigrations(this.pool);
        this.logger.log('Database migration completed. Run POST /api/system/bootstrap to create the base records.');
      } else {
        this.logger.log('Database connected and schema verified.');
      }
      // Idempotent column additions the application relies on (e.g. users.display_name)
      await this.pool.query(SCHEMA_PATCH_SQL);
    } catch (err: any) {
      this.logger.warn(`Database schema check / migration: ${err?.message || err}`);
    }
  }

  async onModuleDestroy() {
    if (this.pool && typeof this.pool.end === 'function') {
      await this.pool.end();
    }
  }

  /**
   * Runs a query with the row-level-security context of the current request.
   * The session variables are set on the pooled connection before every query (also when they
   * are empty), so a connection never carries another request's tenant into the next query.
   */
  async query<T extends pg.QueryResultRow = any>(sql: string, params: any[] = []): Promise<pg.QueryResult<T>> {
    const ctx = getDbContext();
    const client = await this.pool.connect();
    try {
      await client.query(
        `SELECT set_config('app.current_tenant_id', $1, false), set_config('app.bypass_rls', $2, false)`,
        [ctx?.tenantId || '', ctx?.bypassRls ? 'on' : ''],
      );
      return await client.query<T>(sql, params);
    } finally {
      client.release();
    }
  }

  async withTenant<T>(tenantId: string, fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
    // Clear any session-level context left on the pooled connection before the scoped transaction
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `SELECT set_config('app.current_tenant_id', $1, true), set_config('app.bypass_rls', '', true)`,
        [tenantId],
      );
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw err;
    } finally {
      client.release();
    }
  }

  async setClientTenant(client: pg.PoolClient, tenantId: string): Promise<void> {
    return setTenantSession(client, tenantId);
  }
}
